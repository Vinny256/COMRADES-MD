import axios from 'axios';

const bibleCommand = {
    name: "bible",
    category: "religion",
    desc: "Get a specific Bible verse",
    async execute(sock, msg, args, { from, prefix }) {
        const query = args.join(" ");
        
        // --- 🛡️ INPUT VALIDATION ---
        if (!query) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ʙɪʙʟᴇ [ʀᴇғᴇʀᴇɴᴄᴇ]\n│ 📖 *ᴇx:* ${prefix}ʙɪʙʟᴇ ᴊᴏʜɴ 𝟹:𝟷𝟼\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "📖", key: msg.key } });

        try {
            // --- 🚀 FETCH SCRIPTURE ---
            const { data } = await axios.get(`https://bible-api.com/${encodeURIComponent(query)}`);
            
            // --- 📑 SCRIPTURE UI CONSTRUCTION ---
            let bibleMsg = `┌────────────────────────┈\n`;
            bibleMsg += `│      *ᴠ-ʜᴜʙ_sᴄʀɪᴘᴛᴜʀᴇ_ʟᴏɢ* \n`;
            bibleMsg += `└────────────────────────┈\n\n`;
            
            bibleMsg += `┌─『 ʙɪʙʟᴇ_ʀᴇғᴇʀᴇɴᴄᴇ 』\n`;
            bibleMsg += `│ 📖 *ʀᴇғ:* ${data.reference}\n`;
            bibleMsg += `│ 📜 *ᴛᴇxᴛ:* \n`;
            bibleMsg += `│ ${data.text.trim()}\n`;
            bibleMsg += `└────────────────────────┈\n\n`;
            
            bibleMsg += `_✨ ᴛʀᴀɴsʟᴀᴛɪᴏɴ: ᴋɪɴɢ ᴊᴀᴍᴇs ᴠᴇʀsɪᴏɴ_`;

            await sock.sendMessage(from, { 
                text: bibleMsg 
            }, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ᴠᴇʀsᴇ_ɴᴏᴛ_ғᴏᴜɴᴅ*\n│ ⚙ ʟᴏɢ: ɪɴᴠᴀʟɪᴅ_ʀᴇғᴇʀᴇɴᴄᴇ\n└────────────────────────┈` 
            });
        }
    }
};

export default bibleCommand;
