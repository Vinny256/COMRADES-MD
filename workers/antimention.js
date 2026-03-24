import { delay } from "@whiskeysockets/baileys";

/**
 * V-HUB_WORKER: ANTIMENTION_PROTOCOL
 * Detects group mentions in Status/Stories (Stub 131).
 * Logic: Bypasses Admins | Alerts if Bot is not Admin | Kicks for Users.
 */

// --- 🎨 V_HUB ELITE STYLING ---
const vStyle = (text) => `┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sʜɪᴇʟᴅ* \n└────────────────────────┈\n\n│  ${text}\n└────────────────────────┈`;

const antiMentionWorker = {
    name: "antimention_worker",
    async execute(sock, msg, settings) {
        try {
            // 1. Initial Checks
            if (!settings.antimention) return;

            const from = msg.key.remoteJid;
            if (!from || !from.endsWith('@g.us')) return;

            // --- 🔍 STATUS TAG DETECTION ---
            // stubType 131 is the specific code for "Group mentioned in status"
            const isStatusTag = msg.messageStubType === 131;

            if (isStatusTag) {
                const groupMetadata = await sock.groupMetadata(from);
                const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                
                const participants = groupMetadata.participants;
                const botMember = participants.find(p => p.id === botNumber);
                const isBotAdmin = botMember?.admin === 'admin' || botMember?.admin === 'superadmin';

                // Extract the person who made the mention
                const sender = msg.key.participant || msg.messageStubParameters?.[0]; 
                if (!sender) return;

                const senderMember = participants.find(p => p.id === sender);
                const isSenderAdmin = senderMember?.admin === 'admin' || senderMember?.admin === 'superadmin';

                // --- 🚥 SCENARIO 1: BOT IS NOT ADMIN ---
                if (!isBotAdmin) {
                    return sock.sendMessage(from, { 
                        text: vStyle("🚫 *ᴘᴏᴡᴇʀ_ɴᴇᴇᴅᴇᴅ*\n│ ɪ ᴅᴇᴛᴇᴄᴛᴇᴅ ᴀ sᴛᴀᴛᴜs ᴍᴇɴᴛɪᴏɴ,\n│ ʙᴜᴛ ɪ ᴀᴍ ɴᴏᴛ ᴀɴ ᴀᴅᴍɪɴ.\n│ ᴘʀᴏᴍᴏᴛᴇ ᴍᴇ ᴛᴏ ᴋɪᴄᴋ ᴛʜᴇ ᴠɪᴏʟᴀᴛᴏʀ!") 
                    });
                }

                // --- 🚥 SCENARIO 2: SENDER IS ADMIN ---
                if (isSenderAdmin) {
                    return sock.sendMessage(from, { 
                        text: vStyle("⚠️ *ᴀᴅᴍɪɴ_ʙʏᴘᴀss*\n│ ᴀɴ ᴀᴅᴍɪɴ ᴍᴇɴᴛɪᴏɴᴇᴅ ᴛʜɪs ɢʀᴏᴜᴘ\n│ ɪɴ ᴛʜᴇɪʀ sᴛᴀᴛᴜs. ᴘʀᴏᴛᴇᴄᴛɪᴏɴ\n│ ᴘʀᴏᴛᴏᴄᴏʟ ɪɢɴᴏʀᴇᴅ.") 
                    });
                }

                // --- 🚥 SCENARIO 3: SUCCESS (KICK USER) ---
                await sock.sendMessage(from, { 
                    text: vStyle(`🚫 *ᴘʀᴏᴛᴏᴄᴏʟ: ʟᴇssᴏɴ_ᴛᴀᴜɢʜᴛ*\n│ ᴜsᴇʀ @${sender.split('@')[0]}\n│ ᴍᴇɴᴛɪᴏɴᴇᴅ ᴛʜɪs ɢʀᴏᴜᴘ ɪɴ sᴛᴀᴛᴜs.\n│ *ᴀᴄᴛɪᴏɴ:* ᴛᴇʀᴍɪɴᴀᴛᴇᴅ.`),
                    mentions: [sender]
                });

                // Delay kick for 1s to ensure the message delivers first (Reduces "Bad MAC" risk)
                await delay(1000);
                await sock.groupParticipantsUpdate(from, [sender], "remove");
                
                console.log(`┌─『 ᴠ_ʜᴜʙ_sʜɪᴇʟᴅ 』\n│ 🛡️ ᴀᴄᴛɪᴏɴ: ᴀɴᴛɪ-ᴍᴇɴᴛɪᴏɴ_ᴋɪᴄᴋ\n│ 👤 ᴜsᴇʀ: ${sender}\n│ 🏛️ ɢʀᴏᴜᴘ: ${groupMetadata.subject}\n└────────────────────────┈`);
            }
        } catch (err) {
            console.error("🛰️ [ANTIMENTION_ERR]:", err.message);
        }
    }
};

export default antiMentionWorker;
