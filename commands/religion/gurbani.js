import axios from 'axios';

const gurbaniCommand = {
    name: "gurbani",
    category: "religion",
    desc: "Get a random Shabad (verse) from Gurbani",
    async execute(sock, msg, args, { from, prefix }) {
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "ੴ", key: msg.key } });

        try {
            // --- 🚀 FETCH RANDOM SHABAD ---
            const { data } = await axios.get('https://api.gurbaninow.com/v2/shabad/random');
            
            // Extracting Gurmukhi and English Translation
            const verse = data.shabad[0].line.larivaar.unicode;
            const translation = data.shabad[0].line.translation.english.default;

            // --- 📑 SCRIPTURE UI CONSTRUCTION ---
            let gurbaniMsg = `┌────────────────────────┈\n`;
            gurbaniMsg += `│      *ᴠ-ʜᴜʙ_sɪᴋʜ_ʟᴏɢ* \n`;
            gubaniMsg += `└────────────────────────┈\n\n`;
            
            gurbaniMsg += `┌─『 sʜᴀʙᴀᴅ_ɪɴsɪɢʜᴛ 』\n`;
            gurbaniMsg += `│ ੴ *ᴠᴇʀsᴇ:* \n`;
            gurbaniMsg += `│ ${verse}\n`;
            gurbaniMsg += `│ \n`;
            gurbaniMsg += `│ 📜 *ᴛʀᴀɴsʟᴀᴛɪᴏɴ:* \n`;
            gurbaniMsg += `│ ${translation}\n`;
            gurbaniMsg += `└────────────────────────┈\n\n`;
            
            gurbaniMsg += `_✨ ᴡɪsᴅᴏᴍ ᴏꜰ ᴛʜᴇ ɢᴜʀᴜs_`;

            await sock.sendMessage(from, { 
                text: gurbaniMsg 
            }, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ɢᴜʀʙᴀɴɪ_ᴅɪsᴄᴏɴɴᴇᴄᴛ*\n│ ⚙ ʟᴏɢ: sᴇʀᴠᴇʀ_ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ\n└────────────────────────┈` 
            });
        }
    }
};

export default gurbaniCommand;
