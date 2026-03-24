import fs from 'fs-extra';

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: READ_ENGINE
 * Filename: read.js
 * Handles Startup Grace Protection & Auto-View.
 */
const readWorker = {
    name: "read_worker",
    async execute(sock, msg, settings) {
        try {
            // 1. Operational Check
            if (!settings.autoview) return;

            const from = msg.key.remoteJid;
            if (!from) return;

            // 2. ⏳ STARTUP GRACE PROTECTION
            // Logic: Ignore messages older than the current bot session to prevent Bad MAC loops.
            const messageTimestamp = (msg.messageTimestamp * 1000) || Date.now();
            const botStartTime = global.connectionOpenTime || Date.now();
            
            if (messageTimestamp < botStartTime) return;

            // 3. 🛡️ LOCK CHECK
            if (global.lockedContacts && global.lockedContacts.has(from)) return;

            // 4. 🚥 VIEW HANDSHAKE
            await sock.readMessages([msg.key]);

            // 5. 📱 LOGGING
            const participant = msg.key.participant || from;
            const name = msg.pushName || participant.split('@')[0];

            if (from === 'status@broadcast') {
                console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sᴛᴀᴛᴜs_ᴠɪᴇᴡ* \n└────────────────────────┈\n\n│ 👤 ғʀᴏᴍ: ${name}\n│ ✅ sᴛᴀᴛ: sᴜᴄᴄᴇssғᴜʟ\n└────────────────────────┈`);
            } else {
                console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_ᴍsɢ_ʀᴇᴀᴅ* \n└────────────────────────┈\n\n│ 👤 ғʀᴏᴍ: ${name}\n│ ✅ sᴛᴀᴛ: ᴀᴄᴛɪᴠᴇ\n└────────────────────────┈`);
            }

        } catch (e) {
            // Silent catch to prevent dyno crashes
        }
    }
};

export default readWorker;
