const riddleCommand = {
    name: "riddle",
    category: "games",
    desc: "Solve a mystery riddle",
    async execute(sock, msg, args, { from, prefix }) {
        // 1. Initialize & Safety Check
        if (!global.gamestate) global.gamestate = new Map();
        
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ_ᴀʟᴇʀᴛ 』\n│ ⚙ ᴀ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ!\n└────────────────────────┈` 
            });
        }

        // 🧠 Riddle Library
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

        // 2. Set Game State
        const gameData = {
            name: "riddle",
            answer: selected.a.toLowerCase(),
            startTime: Date.now()
        };

        global.gamestate.set(from, gameData);

        // --- ✦ PREMIUM CHALLENGE UI ---
        let challenge = `┌────────────────────────┈\n`;
        challenge += `│      *ᴠ-ʜᴜʙ_ᴍʏsᴛᴇʀʏ* \n`;
        challenge += `└────────────────────────┈\n\n`;
        challenge += `┌─『 ʀɪᴅᴅʟᴇ_ᴍᴇ_ᴛʜɪs 』\n`;
        challenge += `│ 🤔 *ǫᴜᴇsᴛɪᴏɴ:* \n`;
        challenge += `│ 👉 "${selected.q}"\n`;
        challenge += `│ ⏱️ *ᴛɪᴍᴇ:* 𝟺𝟻 sᴇᴄᴏɴᴅs\n`;
        challenge += `└────────────────────────┈\n\n`;
        challenge += `◈ *ʀᴇᴘʟʏ:* ᴛʏᴘᴇ ʏᴏᴜʀ ɢᴜᴇss!`;
        
        await sock.sendMessage(from, { text: challenge });

        // 3. Auto-Timeout Logic
        setTimeout(async () => {
            if (global.gamestate.has(from) && global.gamestate.get(from).name === "riddle") {
                global.gamestate.delete(from);
                await sock.sendMessage(from, { 
                    text: `┌─『 ᴛɪᴍᴇ_ᴏᴜᴛ 』\n│ ⚙ ᴍʏsᴛᴇʀʏ ᴜɴsᴏʟᴠᴇᴅ.\n│ ✅ *ᴀɴsᴡᴇʀ:* ${selected.a.toUpperCase()}\n└────────────────────────┈` 
                });
            }
        }, 45000);
    },

    // 🕹️ Interceptor Logic
    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const userGuess = text.trim().toLowerCase();

        if (userGuess === game.answer) {
            const winner = msg.pushName || "ɢᴇɴɪᴜs";

            let victory = `┌────────────────────────┈\n`;
            victory += `│      *ᴇᴜʀᴇᴋᴀ_ᴍᴏᴍᴇɴᴛ* \n`;
            victory += `└────────────────────────┈\n\n`;
            victory += `┌─『 sᴏʟᴠᴇᴅ 』\n`;
            victory += `│ 👤 *ᴜsᴇʀ:* ${winner}\n`;
            victory += `│ ✅ *ᴀɴsᴡᴇʀ:* ${game.answer.toUpperCase()}\n`;
            victory += `└────────────────────────┈\n\n`;
            victory += `_ʏᴏᴜ'ᴠᴇ sᴏʟᴠᴇᴅ ᴛʜᴇ ᴍʏsᴛᴇʀʏ._`;

            await sock.sendMessage(from, { text: victory }, { quoted: msg });
            global.gamestate.delete(from);
        }
    }
};

export default riddleCommand;
