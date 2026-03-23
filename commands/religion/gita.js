import axios from 'axios';

const gitaCommand = {
    name: "gita",
    category: "religion",
    desc: "Get a verse from the Bhagavad Gita",
    async execute(sock, msg, args, { from, prefix }) {
        const query = args[0]; // Format: Chapter:Verse (e.g., 2:47)
        
        // --- 🛡️ INPUT VALIDATION ---
        if (!query || !query.includes(':')) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ɢɪᴛᴀ [ᴄʜ:ᴠʀ]\n│ 🕉️ *ᴇx:* ${prefix}ɢɪᴛᴀ 𝟸:𝟺𝟽\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🕉️", key: msg.key } });

        try {
            const [ch, vr] = query.split(':');
            // --- 🚀 FETCH VEDIC SCRIPTURE ---
            const { data } = await axios.get(`https://bhagavadgitaapi.com/api/v1/chapters/${ch}/verses/${vr}`);
            
            // --- 📑 SCRIPTURE UI CONSTRUCTION ---
            let gitaMsg = `┌────────────────────────┈\n`;
            gitaMsg += `│      *ᴠ-ʜᴜʙ_ᴠᴇᴅɪᴄ_ʟᴏɢ* \n`;
            gitaMsg += `└────────────────────────┈\n\n`;
            
            gitaMsg += `┌─『 ʙʜᴀɢᴀᴠᴀᴅ_ɢɪᴛᴀ 』\n`;
            gitaMsg += `│ 📖 *ʀᴇғ:* ᴄʜᴀᴘᴛᴇʀ ${ch} | ᴠᴇʀsᴇ ${vr}\n`;
            gitaMsg += `│ 🕉️ *sᴀɴsᴋʀɪᴛ:* \n`;
            gitaMsg += `│ ${data.text}\n`;
            gitaMsg += `│ \n`;
            gitaMsg += `│ 📜 *ᴛʀᴀɴsʟɪᴛᴇʀᴀᴛɪᴏɴ:* \n`;
            gitaMsg += `│ ${data.transliteration}\n`;
            gitaMsg += `│ \n`;
            gitaMsg += `│ ✨ *ᴍᴇᴀɴɪɴɢ:* \n`;
            gitaMsg += `│ ${data.meaning}\n`;
            gitaMsg += `└────────────────────────┈\n\n`;
            
            gitaMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: gitaMsg 
            }, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ᴠᴇʀsᴇ_ɴᴏᴛ_ғᴏᴜɴᴅ*\n│ ⚙ ʟᴏɢ: ɪɴᴠᴀʟɪᴅ_ᴘᴀʀᴀᴍᴇᴛᴇʀs\n└────────────────────────┈` 
            });
        }
    }
};

export default gitaCommand;
