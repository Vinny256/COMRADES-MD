import axios from 'axios';

const buddhaCommand = {
    name: "buddha",
    category: "religion",
    desc: "Get Buddhist wisdom/quotes",
    async execute(sock, msg, args, { from, prefix }) {
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🧘", key: msg.key } });

        try {
            // --- 🚀 FETCH ZEN WISDOM ---
            // ZenQuotes API returns an array of quote objects
            const { data } = await axios.get('https://zenquotes.io/api/random');
            const quote = data[0].q;
            const author = data[0].a;

            // --- 📑 WISDOM UI CONSTRUCTION ---
            let wisdomMsg = `┌────────────────────────┈\n`;
            wisdomMsg += `│      *ᴠ-ʜᴜʙ_sᴘɪʀɪᴛᴜᴀʟ_ʟᴏɢ* \n`;
            wisdomMsg += `└────────────────────────┈\n\n`;
            
            wisdomMsg += `┌─『 ᴢᴇɴ_ɪɴsɪɢʜᴛ 』\n`;
            wisdomMsg += `│ ☸️ *ǫᴜᴏᴛᴇ:* \n`;
            wisdomMsg += `│ "${quote}"\n`;
            wisdomMsg += `│ \n`;
            wisdomMsg += `│ 🙏 *ᴀᴜᴛʜᴏʀ:* ${author}\n`;
            wisdomMsg += `└────────────────────────┈\n\n`;
            
            wisdomMsg += `_✨ ᴍɪɴᴅꜰᴜʟɴᴇss ᴇɴʟɪɢʜᴛᴇɴᴍᴇɴᴛ_`;

            await sock.sendMessage(from, { 
                text: wisdomMsg 
            }, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *sᴘɪʀɪᴛᴜᴀʟ_ᴅɪsᴄᴏɴɴᴇᴄᴛ*\n│ ⚙ ʟᴏɢ: ᴀᴘɪ_ʀᴇǫᴜᴇsᴛ_ғᴀɪʟᴇᴅ\n└────────────────────────┈` 
            });
        }
    }
};

export default buddhaCommand;
