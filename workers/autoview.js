import fs from 'fs-extra';
import { delay } from "@whiskeysockets/baileys";

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: AUTO_READ_ENGINE
 * Handles Auto-View for Statuses and Auto-Read for Chats/Groups.
 * Includes "Bad MAC" Grace Protection and Startup Filtering.
 */
const autoReadWorker = {
    name: "autoview_worker",
    async execute(sock, msg, settings) {
        try {
            // 1. Initial Logic Guard
            if (!settings.autoview) return;

            const from = msg.key.remoteJid;
            if (!from) return;

            // 2. ⏳ STARTUP GRACE PROTECTION (PRESERVED)
            // Logic: If message is older than the bot's current session start, ignore it.
            // This stops the bot from trying to decrypt old messages that cause Bad MAC crashes.
            const messageTimestamp = (msg.messageTimestamp * 1000) || Date.now();
            const botStartTime = global.connectionOpenTime || Date.now();
            
            if (messageTimestamp < botStartTime) return;

            // 3. 🛡️ LOCK CHECK
            // Prevents trying to read from contacts currently in a "Healing" or "Locked" state.
            if (global.lockedContacts && global.lockedContacts.has(from)) return;

            // 4. 🚥 GLOBAL VIEW ENGINE HANDSHAKE
            // Marks the message as 'Read' on the WhatsApp Servers
            await sock.readMessages([msg.key]);

            // 5. 📱 TERMINAL LOGGING
            const participant = msg.key.participant || from;
            const name = msg.pushName || participant.split('@')[0];

            if (from === 'status@broadcast') {
                console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sᴛᴀᴛᴜs_ᴠɪᴇᴡ* \n└────────────────────────┈\n\n│ 👤 ғʀᴏᴍ: ${name}\n│ ✅ sᴛᴀᴛ: sᴜᴄᴄᴇssғᴜʟ\n└────────────────────────┈`);
            } else {
                // Logic for private chats and group messages
                console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_ᴍsɢ_ʀᴇᴀᴅ* \n└────────────────────────┈\n\n│ 👤 ғʀᴏᴍ: ${name}\n│ ✅ sᴛᴀᴛ: ᴀᴄᴛɪᴠᴇ\n└────────────────────────┈`);
            }

        } catch (e) {
            // Errors here are caught silently to prevent the loop from breaking.
            // The Supervisor in index.js handles the actual reconnection/healing.
        }
    }
};

export default autoReadWorker;
