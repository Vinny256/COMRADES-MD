/**
 * V-HUB_WORKER: ANTILINK_PROTOCOL
 * Monitors and purges forbidden links in Groups.
 * Logic: Bypasses Admins | Alerts if Bot is not Admin | Deletes for Users.
 */

// --- 🎨 V_HUB ELITE STYLING ---
const vStyle = (text) => `┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sʜɪᴇʟᴅ* \n└────────────────────────┈\n\n│  ${text}\n└────────────────────────┈`;

const antiLinkWorker = {
    name: "antilink_worker",
    async execute(sock, msg, settings) {
        try {
            // 1. Operational Checks
            if (!settings.antilink) return;
            const from = msg.key.remoteJid;
            if (!from || !from.endsWith('@g.us')) return;

            // 2. Link Detection (WhatsApp, HTTP, HTTPS)
            const textContent = (
                msg.message?.conversation || 
                msg.message?.extendedTextMessage?.text || 
                msg.message?.imageMessage?.caption || ""
            );
            const hasLink = /chat.whatsapp.com|http:\/\/|https:\/\//gi.test(textContent);

            if (hasLink) {
                const groupMetadata = await sock.groupMetadata(from);
                const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const participants = groupMetadata.participants;
                
                // Bot Status Check
                const botMember = participants.find(p => p.id === botNumber);
                const isBotAdmin = botMember?.admin === 'admin' || botMember?.admin === 'superadmin';

                // Sender Status Check
                const sender = msg.key.participant || from;
                const senderMember = participants.find(p => p.id === sender);
                const isSenderAdmin = senderMember?.admin === 'admin' || senderMember?.admin === 'superadmin';

                // --- 🛡️ VOCAL LOGIC ENGINE (PRESERVED) ---

                // CASE 1: SENDER IS ADMIN (Bypass Protocol)
                if (isSenderAdmin) {
                    return sock.sendMessage(from, { 
                        text: vStyle("⚠️ *ᴀᴅᴍɪɴ_ᴅᴇᴛᴇᴄᴛᴇᴅ*\n│ ɪ ᴅᴇᴛᴇᴄᴛᴇᴅ ᴀ ʟɪɴᴋ, ʙᴜᴛ sɪɴᴄᴇ\n│ ʏᴏᴜ ᴀʀᴇ ᴀɴ ᴀᴅᴍɪɴ, ɪ ʜᴀᴠᴇ\n│ ʙʏᴘᴀssᴇᴅ ᴛʜᴇ ᴅᴇʟᴇᴛɪᴏɴ.") 
                    }, { quoted: msg });
                }

                // CASE 2: BOT IS NOT ADMIN (Power Request Protocol)
                if (!isBotAdmin) {
                    return sock.sendMessage(from, { 
                        text: vStyle("🚫 *ᴘᴏᴡᴇʀ_ɴᴇᴇᴅᴇᴅ*\n│ ɪ ᴅᴇᴛᴇᴄᴛᴇᴅ ᴀ ғᴏʀʙɪᴅᴅᴇɴ ʟɪɴᴋ,\n│ ʙᴜᴛ ɪ ᴀᴍ ɴᴏᴛ ᴀɴ ᴀᴅᴍɪɴ.\n│ ᴘʀᴏᴍᴏᴛᴇ ᴍᴇ ᴛᴏ ᴇɴғᴏʀᴄᴇ ʀᴜʟᴇs!") 
                    }, { quoted: msg });
                }

                // CASE 3: SUCCESS (Purge Protocol)
                // Step A: Warning Notification
                await sock.sendMessage(from, { 
                    text: vStyle("🗑️ *ʟɪɴᴋ_ᴘᴜʀɢᴇᴅ*\n│ ᴀ ғᴏʀʙɪᴅᴅᴇɴ ʟɪɴᴋ ᴡᴀs ᴅᴇᴛᴇᴄᴛᴇᴅ.\n│ ᴘʀɪᴠᴀᴄʏ ᴀɴᴅ sᴇᴄᴜʀɪᴛʏ ᴘʀᴏᴛᴏᴄᴏʟs\n│ ʜᴀᴠᴇ ʀᴇᴍᴏᴠᴇᴅ ᴛʜᴇ ᴍᴇssᴀɢᴇ.") 
                }, { quoted: msg });

                // Step B: Immediate Deletion
                await sock.sendMessage(from, { delete: msg.key });
                
                console.log(`┌─『 ᴠ_ʜᴜʙ_sʜɪᴇʟᴅ 』\n│ 🛡️ ᴀᴄᴛɪᴏɴ: ʟɪɴᴋ_ᴘᴜʀɢᴇᴅ\n│ 🏛️ ɢʀᴏᴜᴘ: ${groupMetadata.subject}\n└────────────────────────┈`);
            }
        } catch (err) { 
            console.error("🛰️ [ANTILINK_ERR]:", err.message);
        }
    }
};

export default antiLinkWorker;
