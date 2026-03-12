const axios = require('axios');

module.exports = {
    name: 'paper',
    category: 'school',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        let query = args.join(" ").toUpperCase();

        if (!query) return sock.sendMessage(from, { text: "🎓 *ᴜᴏᴇᴍ ᴇxᴀᴍ ʜᴜʙ*\n\nᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴜɴɪᴛ ᴄᴏᴅᴇ.\nExample: `.paper SCH 303`" });

        // Auto-formatter: "sch303" -> "SCH 303"
        if (/^[A-Z]{3}\d{3}$/.test(query)) {
            query = query.replace(/^([A-Z]{3})(\d{3})$/, '$1 $2');
        }

        await sock.sendMessage(from, { text: `🔍 *sᴇᴀʀᴄʜɪɴɢ ᴀʟʟ ʏᴇᴀʀs ꜰᴏʀ:* ${query}...` });

        try {
            const res = await axios.get(`https://app.myloft.xyz/api/v1/search?q=${encodeURIComponent(query)}&institute=universityofembu`, {
                headers: { 
                    'Authorization': `Bearer ${process.env.MYLOFT_TOKEN}`,
                    'x-institute-id': 'ckrbl03avgtd00927jjb3gvqn',
                    'User-Agent': 'MyLoft/3.0.1 (Android 12; Pixel 6)',
                    'x-platform': 'android'
                }
            });

            const results = res.data?.results || [];

            if (results.length === 0) {
                return sock.sendMessage(from, { text: `❌ *ɴᴏ ᴘᴀᴘᴇʀs ꜰᴏᴜɴᴅ*\n\n"${query}" does not appear in the UoEm MyLoft archives.` });
            }

            // If only one result is found, send it immediately
            if (results.length === 1) {
                const paper = results[0];
                return await sock.sendMessage(from, { 
                    document: { url: paper.file_url || paper.link }, 
                    fileName: `${query}_Past_Paper.pdf`,
                    mimetype: 'application/pdf',
                    caption: `┏━━━━━ ✿ *ᴜᴏᴇᴍ_ᴘᴀᴘᴇʀs* ✿ ━━━━━┓\n┃\n┃ ✅ *ꜰᴏᴜɴᴅ:* ${paper.title || query}\n┃ 🏛️ *ᴀᴄᴄᴇss:* ᴍᴏʙɪʟᴇ_ᴀᴘɪ\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃ _ᴘʀᴏᴠɪᴅᴇᴅ ʙʏ ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ_\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
                });
            }

            // If multiple years/versions are found, list them
            let menuText = `📚 *ᴍᴜʟᴛɪᴘʟᴇ ᴘᴀᴘᴇʀs ꜰᴏᴜɴᴅ ꜰᴏʀ ${query}*\n\n`;
            results.forEach((paper, index) => {
                menuText += `${index + 1}. 📄 *${paper.title || query}*\n`;
            });
            menuText += `\n_Downloading the most recent one for you now..._`;

            await sock.sendMessage(from, { text: menuText });

            // Automatically send the first (usually most relevant/recent) one
            const bestMatch = results[0];
            await sock.sendMessage(from, { 
                document: { url: bestMatch.file_url || bestMatch.link }, 
                fileName: `${bestMatch.title || query}.pdf`,
                mimetype: 'application/pdf',
                caption: `✅ *Here is the best match for ${query}*`
            });

        } catch (e) {
            console.error("UoEm Command Error:", e.message);
            await sock.sendMessage(from, { text: "⚠️ *ʟɪʙʀᴀʀʏ ʟᴏᴄᴋᴇᴅ:* The Master Token has expired. Admin must refresh it." });
        }
    }
};
