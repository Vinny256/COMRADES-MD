const akinGame = {
    name: "akin",
    category: "games",
    desc: "Think of a character and I will guess it!",
    async execute(sock, msg, args, { from }) {
        // 1. Check for existing game state
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ_ᴀʟᴇʀᴛ 』\n│ ⚙ ᴀ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ!\n└────────────────────────┈` 
            });
        }

        // 🧠 Logic Tree questions
        const questions = [
            "Is your character from an Anime?", 
            "Is your character a Male?",
            "Is your character the main protagonist?",
            "Does your character wear Red or Orange?"
        ];

        const gameData = {
            name: "akin",
            step: 0,
            questions,
            answers: [],
            player: msg.key.participant || from
        };

        global.gamestate.set(from, gameData);

        // --- ✦ PREMIUM INTRO UI ---
        let intro = `┌────────────────────────┈\n`;
        intro += `│      *ᴠ-ʜᴜʙ_ᴀᴋɪɴᴀᴛᴏʀ* \n`;
        intro += `└────────────────────────┈\n\n`;
        intro += `┌─『 ᴛʜɪɴᴋ_ᴏғ_ᴀ_ᴄʜᴀʀᴀᴄᴛᴇʀ 』\n`;
        intro += `│ 🧞 *sᴛᴀᴛᴜs:* ɪɴɪᴛɪᴀʟɪᴢɪɴɢ...\n`;
        intro += `│ ⚙ *ǫ𝟷:* ${questions[0]}\n`;
        intro += `└────────────────────────┈\n\n`;
        intro += `◈ *ʀᴇᴘʟʏ:* ʏᴇs | ɴᴏ`;
        
        await sock.sendMessage(from, { text: intro });
    },

    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const ans = text.toLowerCase().trim();

        // Only process valid responses
        if (ans !== 'yes' && ans !== 'no') return;

        game.answers.push(ans);
        game.step++;

        if (game.step < game.questions.length) {
            // --- ✦ NEXT QUESTION UI ---
            let nextQ = `┌────────────────────────┈\n`;
            nextQ += `│      *ᴠ-ʜᴜʙ_ᴀᴋɪɴᴀᴛᴏʀ* \n`;
            nextQ += `└────────────────────────┈\n\n`;
            nextQ += `┌─『 sᴛᴇᴘ_𝟶${game.step + 1} 』\n`;
            nextQ += `│ ⚙ *ǫᴜᴇsᴛɪᴏɴ:* ${game.questions[game.step]}\n`;
            nextQ += `└────────────────────────┈\n\n`;
            nextQ += `◈ *ʀᴇᴘʟʏ:* ʏᴇs | ɴᴏ`;

            await sock.sendMessage(from, { text: nextQ });
        } else {
            // 🔮 THE FINAL GUESSING LOGIC
            let guess = "ɪʀᴏɴ ᴍᴀɴ"; 
            if (game.answers[0] === 'yes' && game.answers[3] === 'yes') guess = "ɴᴀʀᴜᴛᴏ ᴜᴢᴜᴍᴀᴋɪ";
            else if (game.answers[0] === 'yes' && game.answers[3] === 'no') guess = "ᴍᴏɴᴋᴇʏ ᴅ. ʟᴜғғʏ";
            else if (game.answers[0] === 'no' && game.answers[1] === 'yes') guess = "sᴘɪᴅᴇʀ-ᴍᴀɴ";
            else guess = "ᴛᴀʏʟᴏʀ sᴡɪғᴛ";

            // --- ✦ FINAL RESULT UI ---
            let result = `┌────────────────────────┈\n`;
            result += `│      *ᴠ-ʜᴜʙ_ᴀᴋɪɴᴀᴛᴏʀ* \n`;
            result += `└────────────────────────┈\n\n`;
            result += `┌─『 ɪ_ʜᴀᴠᴇ_ᴅᴇᴄɪᴅᴇᴅ 』\n`;
            result += `│ 🎭 *ᴄʜᴀʀᴀᴄᴛᴇʀ:* ${guess}\n`;
            result += `│ ⚙ *sᴛᴀᴛᴜs:* ᴄᴏᴍᴘʟᴇᴛᴇ ✦\n`;
            result += `└────────────────────────┈\n\n`;
            result += `_ᴡᴀs ɪ ʀɪɢʜᴛ? ᴛʏᴘᴇ .ᴀᴋɪɴ ᴛᴏ ʀᴇsᴛᴀʀᴛ!_`;
            
            await sock.sendMessage(from, { text: result });
            global.gamestate.delete(from);
        }
    }
};

export default akinGame;
