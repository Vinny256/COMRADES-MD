module.exports = {
    name: "math",
    category: "games",
    desc: "Speed math challenge",
    async execute(sock, msg, args, { from }) {
        // ✅ ADDED OPTIONAL CHAINING (?.) TO PREVENT "UNDEFINED" CRASH
        if (global.gamestate?.has?.(from)) {
            return sock.sendMessage(from, { text: "❌ A game is already active here!" });
        }

        // Generate Random Math Problem
        const operators = ['+', '-', '*'];
        const op = operators[Math.floor(Math.random() * operators.length)];
        let num1, num2;

        if (op === '*') {
            num1 = Math.floor(Math.random() * 12) + 1;
            num2 = Math.floor(Math.random() * 12) + 1;
        } else {
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * 100) + 1;
        }

        const answer = eval(`${num1} ${op} ${num2}`);

        // Set Game State
        const gameData = {
            name: "math",
            answer: answer.toString(),
            startTime: Date.now()
        };

        // ✅ SAFE SET (Ensures gamestate exists before setting)
        if (!global.gamestate) global.gamestate = new Map();
        global.gamestate.set(from, gameData);

        const challenge = `┏━━━━━ ✿ *V_HUB MATH* ✿ ━━━━━┓\n┃\n┃  ❓ *Solve this fast:* \n┃  👉  *${num1} ${op === '*' ? '×' : op} ${num2} = ?*\n┃\n┃  ⏱️ *Time:* 15 Seconds\n┃  💰 *Reward:* Bragging Rights\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
        
        await sock.sendMessage(from, { text: challenge });

        // Auto-delete game if no one answers in 15 seconds
        setTimeout(async () => {
            if (global.gamestate?.has?.(from) && global.gamestate?.get?.(from)?.name === "math") {
                global.gamestate.delete(from);
                await sock.sendMessage(from, { text: `⏰ *TIME OUT!* No one answered.\nCorrect was: *${answer}*` });
            }
        }, 15000);
    },

    // 🕹️ The Interceptor Logic
    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const userAnswer = text.trim();

        if (userAnswer === game.answer) {
            const timeTaken = ((Date.now() - game.startTime) / 1000).toFixed(2);
            const winner = msg.pushName || "User";

            await sock.sendMessage(from, { 
                text: `🏆 *WINNER!* \n\n👤 *User:* ${winner}\n✅ *Answer:* ${game.answer}\n⚡ *Speed:* ${timeTaken} seconds\n\n_Game Over._` 
            }, { quoted: msg });

            global.gamestate?.delete?.(from);
        }
    }
};
