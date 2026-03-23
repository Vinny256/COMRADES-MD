const mathChallenge = {
    name: "math",
    category: "games",
    desc: "Speed math challenge",
    async execute(sock, msg, args, { from, prefix }) {
        // 1. Initialize & Safety Check
        if (!global.gamestate) global.gamestate = new Map();
        
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ_ᴀʟᴇʀᴛ 』\n│ ⚙ ᴀ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ!\n└────────────────────────┈` 
            });
        }

        // 2. Generate Random Problem
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

        // Calculate Answer (Safe Eval substitute for simple math)
        const mathOp = op === '*' ? '*' : op;
        const answer = Function(`return ${num1} ${mathOp} ${num2}`)();

        // 3. Set Game State
        const gameData = {
            name: "math",
            answer: answer.toString(),
            startTime: Date.now()
        };

        global.gamestate.set(from, gameData);

        // --- ✦ PREMIUM CHALLENGE UI ---
        let challenge = `┌────────────────────────┈\n`;
        challenge += `│      *ᴠ-ʜᴜʙ_ᴍᴀᴛʜ_ʙʟɪᴛᴢ* \n`;
        challenge += `└────────────────────────┈\n\n`;
        challenge += `┌─『 sᴘᴇᴇᴅ_ᴄʜᴀʟʟᴇɴɢᴇ 』\n`;
        challenge += `│ ❓ *sᴏʟᴠᴇ ᴛʜɪs ғᴀsᴛ:* \n`;
        challenge += `│ 👉 *${num1} ${op === '*' ? '×' : op} ${num2} = ?*\n`;
        challenge += `│ ⏱️ *ᴛɪᴍᴇ:* 𝟷𝟻 sᴇᴄᴏɴᴅs\n`;
        challenge += `└────────────────────────┈\n\n`;
        challenge += `◈ *ʀᴇᴘʟʏ:* ᴛʏᴘᴇ ᴛʜᴇ ᴀɴsᴡᴇʀ!`;
        
        await sock.sendMessage(from, { text: challenge });

        // 4. Auto-Timeout Logic
        setTimeout(async () => {
            if (global.gamestate.has(from) && global.gamestate.get(from).name === "math") {
                global.gamestate.delete(from);
                await sock.sendMessage(from, { 
                    text: `┌─『 ᴛɪᴍᴇ_ᴏᴜᴛ 』\n│ ⚙ ɴᴏ ᴏɴᴇ ᴀɴsᴡᴇʀᴇᴅ ɪɴ ᴛɪᴍᴇ.\n│ ✅ *ᴀɴsᴡᴇʀ:* ${answer}\n└────────────────────────┈` 
                });
            }
        }, 15000);
    },

    // 🕹️ Interceptor Logic
    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const userAnswer = text.trim();

        if (userAnswer === game.answer) {
            const timeTaken = ((Date.now() - game.startTime) / 1000).toFixed(2);
            const winner = msg.pushName || "ᴜsᴇʀ";

            let victory = `┌────────────────────────┈\n`;
            victory += `│      *ᴍᴀᴛʜ_ᴄʜᴀᴍᴘɪᴏɴ* \n`;
            victory += `└────────────────────────┈\n\n`;
            victory += `┌─『 ᴡɪɴɴᴇʀ_ᴅᴇᴛᴀɪʟs 』\n`;
            victory += `│ 👤 *ᴜsᴇʀ:* ${winner}\n`;
            victory += `│ ✅ *ᴀɴsᴡᴇʀ:* ${game.answer}\n`;
            victory += `│ ⚡ *sᴘᴇᴇᴅ:* ${timeTaken}s\n`;
            victory += `└────────────────────────┈\n\n`;
            victory += `_ɢᴀᴍᴇ ᴏᴠᴇʀ. ɢɢ!_`;

            await sock.sendMessage(from, { text: victory }, { quoted: msg });
            global.gamestate.delete(from);
        }
    }
};

export default mathChallenge;
