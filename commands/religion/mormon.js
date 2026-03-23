import axios from 'axios';

const mormonCommand = {
    name: "mormon",
    category: "religion",
    desc: "Get a verse from the Book of Mormon",
    async execute(sock, msg, args, { from, prefix }) {
        const query = args.join(" "); // e.g., 1 Nephi 1:1
        
        // --- 🛡️ INPUT VALIDATION ---
        if (!query) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴍᴏʀᴍᴏɴ [ʀᴇғᴇʀᴇɴᴄᴇ]\n│ ⛪ *ᴇx:* ${prefix}ᴍᴏʀᴍᴏɴ 𝟷 ɴᴇᴘʜɪ 𝟷:𝟷\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "⛪", key: msg.key } });

        try {
            // --- 🚀 FETCH SCRIPTURE ---
            const { data } = await axios.get(`https://api.nephi.org/scriptures/?q=${encodeURIComponent(query)}`);
            
            // Check if results exist
            if (!data.scriptures || data.scriptures.length === 0) throw new Error("ɴᴏ_ʀᴇsᴜʟᴛs");
            
            const verse = data.scriptures[0];

            // --- 📑 SCRIPTURE UI CONSTRUCTION ---
            let mormonMsg = `┌────────────────────────┈\n`;
            mormonMsg += `│      *ᴠ-ʜᴜʙ_ʟᴅs_sᴄʀɪᴘᴛᴜʀᴇ* \n`;
            mormonMsg += `└────────────────────────┈\n\n`;
            
            mormonMsg += `┌─『 ʙᴏᴏᴋ_ᴏғ_ᴍᴏʀᴍᴏɴ 』\n`;
            mormonMsg += `│ 📖 *ʀᴇғ:* ${verse.reference}\n`;
            mormonMsg += `│ 📜 *ᴛᴇxᴛ:* \n`;
            mormonMsg += `│ ${verse.text.trim()}\n`;
            mormonMsg += `└────────────────────────┈\n\n`;
            
            mormonMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: mormonMsg 
            }, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ᴠᴇʀsᴇ_ɴᴏᴛ_ғᴏᴜɴᴅ*\n│ ⚙ ʟᴏɢ: ɪɴᴠᴀʟɪᴅ_ʀᴇғᴇʀᴇɴᴄᴇ\n└────────────────────────┈` 
            });
        }
    }
};

export default mormonCommand;
