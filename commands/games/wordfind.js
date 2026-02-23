module.exports = {
    name: "wordfind",
    category: "games",
    desc: "Unscramble the word to win!",
    async execute(sock, msg, args, { from }) {
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { text: "❌ A game is already active in this chat!" });
        }

        // 📚 V_HUB Word Library
        const words = [
            "WHATSAPP", "PYTHON", "VINNIE", "GITHUB", "HEROKU", 
            "JAVASCRIPT", "DATABASE", "ROBOT", "NETWORK", "SECURITY",
            "PREMIUM", "SCRIPT", "MONKEY", "PLANET", "GALAXY"
        ];

        const targetWord = words[Math.floor(Math.random() * words.length)];
        
        // 🌪️ Scramble the word
        const scrambled = targetWord.split('').sort(() => Math.random() - 0.5).join(' ');

        // 🎮 Set Game State
        const gameData = {
            name: "wordfind",
            answer: targetWord,
            startTime: Date.now()
        };

        global.gamestate.set(from, gameData);

        const challenge = `┏━━━━━ ✿ *V_HUB WORD_FIND* ✿ ━━━━━┓\n┃\n┃  🧩 *Unscramble this:* \n┃  👉  *${scrambled}*\n┃\n┃  ⏱️ *Time:* 30 Seconds\n┃  💡 *Hint:* It's a tech/common word\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
        
        await sock.sendMessage(from, { text: challenge });

        // Auto-cleanup after 30 seconds
        setTimeout(async () => {
            if (global.gamestate.has(from) && global.gamestate.get(from).name === "wordfind") {
                const game = global.gamestate.get(from);
                global.gamestate.delete(from);
                await sock.sendMessage(from, { text: `⏰ *TIME'S UP!*\n\nNobody found it. The word was: *${game.answer}*` });
            }
        }, 30000);
    },

    // 🕹️ The Interceptor Logic
    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const userGuess = text.trim().toUpperCase();

        if (userGuess === game.answer) {
            const timeTaken = ((Date.now() - game.startTime) / 1000).toFixed(2);
            const winner = msg.pushName || "Legend";

            await sock.sendMessage(from, { 
                text: `🏆 *CHAMPION!* \n\n👤 *User:* ${winner}\n✅ *Word:* ${game.answer}\n⚡ *Solved in:* ${timeTaken}s\n\n_Game Over._` 
            }, { quoted: msg });

            global.gamestate.delete(from);
        }
    }
};