import axios from 'axios';

const torahCommand = {
    name: "torah",
    category: "religion",
    desc: "Get a verse from the Torah/Tanakh",
    async execute(sock, msg, args, { from, prefix }) {
        const query = args.join(" "); // e.g., Genesis 1:1
        
        // --- 🛡️ INPUT VALIDATION ---
        if (!query) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴛᴏʀᴀʜ [ʀᴇғᴇʀᴇɴᴄᴇ]\n│ ✡️ *ᴇx:* ${prefix}ᴛᴏʀᴀʜ ɢᴇɴᴇsɪs 𝟷:𝟷\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "✡️", key: msg.key } });

        try {
            // --- 🚀 FETCH SCRIPTURE (SEFARIA API) ---
            const { data } = await axios.get(`https://www.sefaria.org/api/texts/${encodeURIComponent(query)}`);
            
            // Clean HTML tags and handle potential array/string returns
            let scriptureText = Array.isArray(data.text) ? data.text.join(' ') : data.text;
            scriptureText = scriptureText.replace(/<[^>]*>/g, '').trim();

            if (!scriptureText) throw new Error("ɴᴏ_ᴄᴏɴᴛᴇɴᴛ");

            // --- 📑 SCRIPTURE UI CONSTRUCTION ---
            let torahMsg = `┌────────────────────────┈\n`;
            torahMsg += `│      *ᴠ-ʜᴜʙ_ᴊᴜᴅᴀɪᴄ_ʟᴏɢ* \n`;
            torahMsg += `└────────────────────────┈\n\n`;
            
            torahMsg += `┌─『 ᴛᴀɴᴀᴋʜ_ʀᴇғ 』\n`;
            torahMsg += `│ 📖 *ʀᴇғ:* ${data.ref}\n`;
            torahMsg += `│ 📜 *ᴛᴇxᴛ:* \n`;
            torahMsg += `│ ${scriptureText}\n`;
            torahMsg += `└────────────────────────┈\n\n`;
            
            torahMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: torahMsg 
            }, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ᴛᴇxᴛ_ɴᴏᴛ_ғᴏᴜɴᴅ*\n│ ⚙ ʟᴏɢ: sᴇғᴀʀɪᴀ_ᴀᴘɪ_ᴇʀʀᴏʀ\n└────────────────────────┈` 
            });
        }
    }
};

export default torahCommand;
