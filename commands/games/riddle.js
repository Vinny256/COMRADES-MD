const axios = require('axios');

module.exports = {
    name: "riddle",
    category: "games",
    desc: "Solve a mystery riddle",
    async execute(sock, msg, args, { from }) {
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { text: "❌ A game is already active!" });
        }

        // 🧠 Riddle Library (Manual list for high quality)
        const riddles = [
            { q: "I have keys, but no locks. I have a space, but no room. You can enter, but can't leave. What am I?", a: "keyboard" },
            { q: "The more of this there is, the less you see. What is it?", a: "darkness" },
            { q: "What has hands, but can't clap?", a: "clock" },
            { q: "What has to be broken before you can use it?", a: "egg" },
            { q: "I’m tall when I’m young, and I’m short when I’m old. What am I?", a: "candle" },
            { q: "What goes up but never comes down?", a: "age" },
            { q: "What has one eye, but can’t see?", a: "needle" }
        ];

        const selected = riddles[Math.floor(Math.random() * riddles.length)];

        // 🎮 Set Game State
        const gameData = {
            name: "riddle",
            answer: selected.a.toLowerCase(),
            startTime: Date.now()
        };

        global.gamestate.set(from, gameData);

        const challenge = `┏━━━━━ ✿ *V_HUB RIDDLE* ✿ ━━━━━┓\n┃\n┃  🤔 *Riddle Me This:* \n┃  👉 "${selected.q}"\n┃\n┃  ⏱️ *Time:* 45 Seconds\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
        
        await sock.sendMessage(from, { text: challenge });

        // Auto-cleanup after 45 seconds
        setTimeout(async () => {
            if (global.gamestate.has(from) && global.gamestate.get(from).name === "riddle") {
                global.gamestate.delete(from);
                await sock.sendMessage(from, { text: `⏰ *TIME OUT!*\n\nYou couldn't solve it. The answer was: *${selected.a.toUpperCase()}*` });
            }
        }, 45000);
    },

    // 🕹️ The Interceptor Logic
    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const userGuess = text.trim().toLowerCase();

        if (userGuess === game.answer) {
            const winner = msg.pushName || "Genius";

            await sock.sendMessage(from, { 
                text: `🌟 *EUREKA!* \n\n👤 *User:* ${winner}\n✅ *Correct Answer:* ${game.answer.toUpperCase()}\n\n_You've solved the mystery._` 
            }, { quoted: msg });

            global.gamestate.delete(from);
        }
    }
};