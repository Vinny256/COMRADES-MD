const wordFindCommand = {
    name: "wordfind",
    category: "games",
    desc: "Unscramble the word to win!",
    async execute(sock, msg, args, { from, prefix }) {
        // 1. Initialize & Safety Check
        if (!global.gamestate) global.gamestate = new Map();
        
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ_ᴀʟᴇʀᴛ 』\n│ ⚙ ᴀ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ!\n└────────────────────────┈` 
            });
        }

        // 📚 V_HUB Word Library
        const words = [
            "WHATSAPP", "PYTHON", "VINNIE", "GITHUB", "HEROKU", 
            "JAVASCRIPT", "DATABASE", "ROBOT", "NETWORK", "SECURITY",
            "PREMIUM", "SCRIPT", "MONKEY", "PLANET", "GALAXY", "KERNEL"
        ];

        const targetWord = words[Math.floor(Math.random() * words.length)];
        
        // 🌪️ Secure Scramble (Ensures the scrambled word is different from the original)
        let scrambled = targetWord;
        while (scrambled === targetWord) {
            scrambled = targetWord.split('').sort(() => Math.random() - 0.5).join(' ');
        }

        // 2. Set Game State
        const gameData = {
            name: "wordfind",
            answer: targetWord,
            startTime: Date.now()
        };

        global.gamestate.set(from, gameData);

        // --- ✦ PREMIUM CHALLENGE UI ---
        let challenge = `┌────────────────────────┈\n`;
        challenge += `│      *ᴠ-ʜᴜʙ_ᴡᴏʀᴅ_ғɪɴᴅ* \n`;
        challenge += `└────────────────────────┈\n\n`;
        challenge += `┌─『 ᴀɴᴀɢʀᴀᴍ_ᴄʜᴀʟʟᴇɴɢᴇ 』\n`;
        challenge += `│ 🧩 *ᴜɴsᴄʀᴀᴍʙʟᴇ ᴛʜɪs:* \n`;
        challenge += `│ 👉 *${scrambled.toUpperCase()}*\n`;
        challenge += `│ ⏱️ *ᴛɪᴍᴇ:* 𝟹𝟶 sᴇᴄᴏɴᴅs\n`;
        challenge += `│ 💡 *ʜɪɴᴛ:* ᴛᴇᴄʜ/ᴄᴏᴍᴍᴏɴ ᴡᴏʀᴅ\n`;
        challenge += `└────────────────────────┈\n\n`;
        challenge += `◈ *ʀᴇᴘʟʏ:* ᴛʏᴘᴇ ᴛʜᴇ ᴄᴏʀʀᴇᴄᴛ ᴡᴏʀᴅ!`;
        
        await sock.sendMessage(from, { text: challenge });

        // 3. Auto-Timeout Logic
        setTimeout(async () => {
            if (global.gamestate.has(from) && global.gamestate.get(from).name === "wordfind") {
                global.gamestate.delete(from);
                await sock.sendMessage(from, { 
                    text: `┌─『 ᴛɪᴍᴇ_ᴏᴜᴛ 』\n│ ⚙ ᴍɪssɪᴏɴ ғᴀɪʟᴇᴅ.\n│ ✅ *ᴀɴsᴡᴇʀ:* ${targetWord}\n└────────────────────────┈` 
                });
            }
        }, 30000);
    },

    // 🕹️ Interceptor Logic
    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const userGuess = text.trim().toUpperCase();

        if (userGuess === game.answer) {
            const timeTaken = ((Date.now() - game.startTime) / 1000).toFixed(2);
            const winner = msg.pushName || "ʟᴇɢᴇɴᴅ";

            let victory = `┌────────────────────────┈\n`;
            victory += `│      *ᴡᴏʀᴅ_ᴍᴀsᴛᴇʀ* \n`;
            victory += `└────────────────────────┈\n\n`;
            victory += `┌─『 ᴄʜᴀᴍᴘɪᴏɴ 』\n`;
            victory += `│ 👤 *ᴜsᴇʀ:* ${winner}\n`;
            victory += `│ ✅ *ᴡᴏʀᴅ:* ${game.answer}\n`;
            victory += `│ ⚡ *sᴘᴇᴇᴅ:* ${timeTaken}s\n`;
            victory += `└────────────────────────┈\n\n`;
            victory += `_ɢᴀᴍᴇ ᴏᴠᴇʀ. ᴇʟɪᴛᴇ ᴘᴇʀғᴏʀᴍᴀɴᴄᴇ._`;

            await sock.sendMessage(from, { text: victory }, { quoted: msg });
            global.gamestate.delete(from);
        }
    }
};

export default wordFindCommand;
