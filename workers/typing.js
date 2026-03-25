import fs from 'fs-extra';
import { delay } from "@whiskeysockets/baileys";

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: TYPING_ENGINE (PRO)
 * Filename: typing.js
 * Features: 30s Immersive Typing | Command Bypass | Scope Filtering.
 */
const typingWorker = {
    name: "typing_worker",
    async execute(sock, msg, settings) {
        try {
            const from = msg.key.remoteJid;
            const isMe = msg.key.fromMe;

            // 1. 🛡️ BASIC FILTERS
            if (!from || isMe || from === 'status@broadcast' || from.endsWith('@newsletter')) return;

            // 2. ⚡ THE COMMAND BYPASS (CRITICAL)
            // If the message starts with your prefix, we exit NOW so the command can run.
            const mtype = Object.keys(msg.message)[0];
            const textContent = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
            const prefix = process.env.PREFIX || ".";
            
            if (textContent.startsWith(prefix)) return;

            // 3. SCOPE FILTERS (all, groups, inbox, or off)
            const isGroup = from.endsWith('@g.us');
            const isInbox = from.endsWith('@s.whatsapp.net');
            const mode = settings.typingMode || 'off'; 
            
            let shouldType = false;
            if (mode === 'all') shouldType = true;
            else if (mode === 'groups' && isGroup) shouldType = true;
            else if (mode === 'inbox' && isInbox) shouldType = true;

            if (!shouldType) return;

            // --- 🚥 30-SECOND IMMERSIVE ENGINE ---
            
            // A. Start "composing" (Ghost Typing)
            await sock.sendPresenceUpdate('composing', from);
            
            console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sʏsᴛᴇᴍ* \n└────────────────────────┈\n\n│ ✍️ sᴛᴀᴛᴜs: ᴛʏᴘɪɴɢ (30s)\n│ 👤 ᴛᴀʀɢᴇᴛ: ${from.split('@')[0]}\n│ ⚙ ᴍᴏᴅᴇ: ɪᴍᴍᴇʀsɪᴠᴇ\n└────────────────────────┈`);
            
            // B. THE 30-SECOND WAIT
            // This happens in the background while your AI worker prepares the reply.
            await delay(30000);
            
            // C. Reset to Paused
            await sock.sendPresenceUpdate('paused', from);

        } catch (e) {
            // Safe catch
        }
    }
};

export default typingWorker;
