import { generateForwardMessageContent, generateWAMessageFromContent } from "@whiskeysockets/baileys";

/**
 * V-HUB_WORKER: STATUS_AUTOSAVE
 * Filename: autosave.js
 * Logic: Automatically forwards all viewed statuses to the Owner's DM.
 */
const autoSaveWorker = {
    name: "autosave_worker",
    async execute(sock, msg, settings) {
        const from = msg.key.remoteJid;
        
        // 1. Logic Guards
        if (from !== 'status@broadcast') return;
        if (msg.key.fromMe) return;

        const senderJid = msg.key.participant || "";
        const senderNumber = senderJid.split('@')[0];
        const ownerNumber = process.env.OWNER_NUMBER || "254768666068";
        const jid = `${ownerNumber}@s.whatsapp.net`;

        // 2. Opt-Out Check (Memory Persistent)
        global.optOutStatus = global.optOutStatus || new Set();
        if (global.optOutStatus.has(senderNumber)) return;

        try {
            const pushName = msg.pushName || "User";
            const caption = `┌────────────────────────┈\n│      *sᴛᴀᴛᴜs_ᴀᴜᴛᴏsᴀᴠᴇᴅ* \n└────────────────────────┈\n\n│ 👤 *ғʀᴏᴍ:* ${pushName}\n│ 📱 *ɴᴜᴍ:* @${senderNumber}\n└────────────────────────┈`;

            // --- 🚀 NATIVE FORWARD HANDSHAKE ---
            // Generates a copy-forward content object
            let staging = await generateForwardMessageContent(msg, true);
            let contentType = Object.keys(staging)[0];
            
            if (!contentType) return;

            // Ensure the caption is added correctly to the forwarded media/text
            if (staging[contentType] && staging[contentType].caption !== undefined) {
                staging[contentType].caption = caption;
            } else if (contentType === 'conversation') {
                staging[contentType] = staging[contentType] + '\n\n' + caption;
            } else if (staging[contentType]) {
                // For images/videos that might not have an existing caption field
                staging[contentType].caption = caption;
            }

            // --- 🚥 RELAY PROTOCOL ---
            const finalMsg = await generateWAMessageFromContent(jid, staging, {});
            await sock.relayMessage(jid, finalMsg.message, { 
                messageId: finalMsg.key.id,
                additionalAttributes: {
                    // Helps prevent "forwarded" tag if you want it clean
                }
            });

            console.log(`┌─『 ᴠ-ʜᴜʙ_ᴀᴜᴛᴏsᴀᴠᴇ 』\n│ ✅ sᴛᴀᴛᴜs_ᴄᴀᴘᴛᴜʀᴇᴅ\n│ 👤 sᴏᴜʀᴄᴇ: ${pushName}\n└────────────────────────┈`);

        } catch (e) {
            // Rate-limit errors are ignored to keep the terminal clean
            if (!e.message.includes('rate-overlimit')) {
                console.error("🛰️ [AUTOSAVE_ERR]:", e.message);
            }
        }
    }
};

export default autoSaveWorker;
