import fs from 'fs-extra';
import { delay } from "@whiskeysockets/baileys";

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: TYPING_ENGINE
 * Filename: typing.js
 * Logic: Ghost Typing | Scope Filters | 10s Human Jitter.
 */
const typingWorker = {
    name: "typing_worker",
    async execute(sock, msg, settings) {
        try {
            const from = msg.key.remoteJid;
            const isMe = msg.key.fromMe;

            // 1. Basic Filters: Skip self, status updates, and newsletters
            if (!from || isMe || from === 'status@broadcast' || from.endsWith('@newsletter')) return;

            // 2. Determine Message Source
            const isGroup = from.endsWith('@g.us');
            const isInbox = from.endsWith('@s.whatsapp.net');

            // 3. Check Custom Scope (all, groups, inbox, or off)
            const mode = settings.typingMode || 'off'; 
            let shouldType = false;

            if (mode === 'all') shouldType = true;
            else if (mode === 'groups' && isGroup) shouldType = true;
            else if (mode === 'inbox' && isInbox) shouldType = true;

            if (!shouldType) return;

            // --- 🚥 10-SECOND TYPING ENGINE ---
            
            // A. Start the "composing" status (Ghost Typing)
            await sock.sendPresenceUpdate('composing', from);
            
            // Custom Vinnie Hub Logging Style
            console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sʏsᴛᴇᴍ* \n└────────────────────────┈\n\n│ ✍️ sᴛᴀᴛᴜs: ᴛʏᴘɪɴɢ\n│ 👤 ᴛᴀʀɢᴇᴛ: ${from.split('@')[0]}\n│ ⚙ sᴄᴏᴘᴇ: ${mode.toUpperCase()}\n└────────────────────────┈`);
            
            // B. THE 10-SECOND WAIT (The "Human Effect")
            // Using Baileys native delay for better event-loop handling
            await delay(10000);
            
            // C. Reset to Paused
            await sock.sendPresenceUpdate('paused', from);

        } catch (e) {
            // Silently catch errors to keep the message queue flowing
        }
    }
};

export default typingWorker;
