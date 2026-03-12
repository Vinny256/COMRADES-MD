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

        await sock.sendMessage(from, { text: `🔍 *sᴇᴀʀᴄʜɪɴɢ:* ${query}...` });

        // Try variations to ensure match
        const variations = [query, query.replace(" ", ""), query.toLowerCase()];
        let results = [];
        let lastRawError = null;

        try {
            for (const term of variations) {
                try {
                    const res = await axios.get(`https://app.myloft.xyz/api/v1/search?q=${encodeURIComponent(term)}&institute=universityofembu`, {
                        headers: { 
                            'Authorization': `Bearer ${process.env.MYLOFT_TOKEN}`,
                            'x-institute-id': 'ckrbl03avgtd00927jjb3gvqn',
                            'User-Agent': 'MyLoft/3.0.1 (Android 12; Pixel 6)',
                            'x-platform': 'android'
                        },
                        timeout: 10000 // 10 second timeout
                    });
                    
                    if (res.data?.results?.length > 0) {
                        results = res.data.results;
                        break; 
                    }
                } catch (innerError) {
                    lastRawError = innerError;
                    continue; 
                }
            }

            if (results.length === 0) {
                // If no results, but we have a raw error from the last attempt, send it
                if (lastRawError && lastRawError.response) {
                    const rawData = JSON.stringify(lastRawError.response.data, null, 2);
                    return sock.sendMessage(from, { 
                        text: `❌ *ᴍʏʟᴏꜰᴛ_sᴇʀᴠᴇʀ_ʀᴇsᴘᴏɴsᴇ:*\n\n\`\`\`${rawData}\`\`\`` 
                    });
                }
                return sock.sendMessage(from, { text: `❌ *ɴᴏ ᴘᴀᴘᴇʀs ꜰᴏᴜɴᴅ:* No matches for "${query}" in the archive.` });
            }

            // Successfully found papers
            const bestMatch = results[0];
            const downloadUrl = bestMatch.file_url || bestMatch.link;

            if (!downloadUrl) {
                return sock.sendMessage(from, { text: "⚠️ *ʟɪɴᴋ ᴇʀʀᴏʀ:* Found the paper metadata, but no PDF link was provided by MyLoft." });
            }

            await sock.sendMessage(from, { 
                document: { url: downloadUrl }, 
                fileName: `${bestMatch.title || query}.pdf`,
                mimetype: 'application/pdf',
                caption: `┏━━━━━ ✿ *ᴜᴏᴇᴍ_ᴘᴀᴘᴇʀs* ✿ ━━━━━┓\n┃\n┃ ✅ *ꜰᴏᴜɴᴅ:* ${bestMatch.title || query}\n┃ 🏛️ *sᴏᴜʀᴄᴇ:* ᴍʏʟᴏꜰᴛ ᴠᴀᴜʟᴛ\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃ _ᴘʀᴏᴠɪᴅᴇᴅ ʙʏ ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ_\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
            });

        } catch (globalError) {
            // SEND REAL SERVER ERROR TO WHATSAPP
            const errorLog = {
                message: globalError.message,
                status: globalError.response?.status,
                statusText: globalError.response?.statusText,
                data: globalError.response?.data || "No response data"
            };

            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *ᴠ_ʜᴜʙ_ᴅᴇʙᴜɢ* ✿ ━━━━━┓\n┃\n┃ ❌ *sᴇʀᴠᴇʀ ᴄʀᴀsʜ ʟᴏɢ*\n┃\n\`\`\`${JSON.stringify(errorLog, null, 2)}\`\`\`\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        }
    }
};
