import axios from 'axios';

const paperCommand = {
    name: 'paper',
    category: 'school',
    desc: 'Fetch past exam papers from UoEm MyLoft Vault',
    async execute(sock, msg, args, { from, prefix }) {
        let query = args.join(" ").toUpperCase();

        // --- 🛡️ INPUT VALIDATION ---
        if (!query) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜᴏᴇᴍ_ᴇxᴀᴍ_ʜᴜʙ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴘᴀᴘᴇʀ [ᴜɴɪᴛ_ᴄᴏᴅᴇ]\n│ 📖 *ᴇx:* ${prefix}ᴘᴀᴘᴇʀ sᴄʜ 𝟹𝟶𝟹\n└────────────────────────┈` 
            });
        }

        // --- 🛠️ AUTO-FORMATTER (sch303 -> SCH 303) ---
        if (/^[A-Z]{3}\d{3}$/.test(query)) {
            query = query.replace(/^([A-Z]{3})(\d{3})$/, '$1 $2');
        }

        // --- ✦ INITIAL REACTION & SEARCH PROMPT ---
        const { key } = await sock.sendMessage(from, { 
            text: `┌─『 ᴠ_ʜᴜʙ_sᴇᴀʀᴄʜ 』\n│ 🔍 *ɪɴᴅᴇxɪɴɢ:* ${query}...\n│ 🏛️ *sᴏᴜʀᴄᴇ:* ᴍʏʟᴏғᴛ_ᴠᴀᴜʟᴛ\n└────────────────────────┈` 
        });

        // Try variations to ensure a match in the MyLoft database
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
                        timeout: 10000 
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

            // --- 🛡️ ERROR HANDLING (NO RESULTS) ---
            if (results.length === 0) {
                if (lastRawError?.response) {
                    const rawData = JSON.stringify(lastRawError.response.data, null, 2);
                    return sock.sendMessage(from, { 
                        text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ᴍʏʟᴏғᴛ_ʀᴇsᴘᴏɴsᴇ:*\n\`\`\`${rawData}\`\`\`\n└────────────────────────┈`,
                        edit: key
                    });
                }
                return sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ 』\n│ ❌ *ɴᴏ_ᴘᴀᴘᴇʀs_ғᴏᴜɴᴅ*\n│ ⚙ ʟᴏɢ: ɴᴏ_ᴍᴀᴛᴄʜᴇs_ғᴏʀ_${query}\n└────────────────────────┈`,
                    edit: key
                });
            }

            // --- 🚀 SUCCESS: EXTRACT PDF ---
            const bestMatch = results[0];
            const downloadUrl = bestMatch.file_url || bestMatch.link;

            if (!downloadUrl) {
                return sock.sendMessage(from, { 
                    text: `┌─『 ᴅᴀᴛᴀ_ᴇʀʀ 』\n│ ⚠️ *ʟɪɴᴋ_ᴍɪssɪɴɢ*\n│ ⚙ ʟᴏɢ: ᴘᴅғ_ɴᴏᴛ_ᴘʀᴏᴠɪᴅᴇᴅ_ʙʏ_ᴠᴀᴜʟᴛ\n└────────────────────────┈`,
                    edit: key
                });
            }

            // --- 📑 DOCUMENT DELIVERY ---
            await sock.sendMessage(from, { 
                document: { url: downloadUrl }, 
                fileName: `${bestMatch.title || query}.pdf`,
                mimetype: 'application/pdf',
                caption: `┌────────────────────────┈\n│      *ᴜᴏᴇᴍ_ᴇxᴀᴍ_ᴠᴀᴜʟᴛ* \n└────────────────────────┈\n\n┌─『 ᴘᴀᴘᴇʀ_ᴅᴇᴛᴀɪʟs 』\n│ ✅ *ғᴏᴜɴᴅ:* ${bestMatch.title || query}\n│ 🏛️ *sᴏᴜʀᴄᴇ:* ᴍʏʟᴏғᴛ_ᴀᴘɪ\n│ 📜 *ғᴏʀᴍᴀᴛ:* ᴘᴅғ_ᴅᴏᴄᴜᴍᴇɴᴛ\n└────────────────────────┈\n\n_ᴘʀᴏᴠɪᴅᴇᴅ ʙʏ ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ_`
            });

            // Cleanup the search message
            await sock.sendMessage(from, { delete: key });

        } catch (globalError) {
            // --- 🛡️ ELITE DEBUG LOG ---
            const errorLog = {
                message: globalError.message,
                status: globalError.response?.status,
                data: globalError.response?.data || "ɴᴏ_ʀᴇsᴘᴏɴsᴇ_ᴅᴀᴛᴀ"
            };

            await sock.sendMessage(from, { 
                text: `┌─『 ᴅᴇʙᴜɢ_ʟᴏɢ 』\n│ ❌ *sʏsᴛᴇᴍ_ᴄʀᴀsʜ*\n\`\`\`${JSON.stringify(errorLog, null, 2)}\`\`\`\n└────────────────────────┈`,
                edit: key 
            });
        }
    }
};

export default paperCommand;
