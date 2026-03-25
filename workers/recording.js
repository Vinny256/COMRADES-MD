import fs from 'fs-extra';
import { delay } from "@whiskeysockets/baileys";

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: RECORDING_ENGINE (PRO)
 * Filename: recording.js
 * Logic: Immersive Recording | Command Bypass | Conflict Shield.
 */
const recordingWorker = {
    name: "recording_worker",
    async execute(sock, msg, settings) {
        try {
            const from = msg.key.remoteJid;
            const isMe = msg.key.fromMe;

            // 1. 🛡️ BASIC FILTERS
            if (!from || isMe || from === 'status@broadcast' || from.endsWith('@newsletter')) return;

            // 2. ⚡ THE COMMAND BYPASS
            const mtype = Object.keys(msg.message)[0];
            const textContent = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
            const prefix = process.env.PREFIX || ".";
            if (textContent.startsWith(prefix)) return;

            // 3. ⚙️ SETTINGS CHECK
            if (!settings.alwaysRecording) return;

            const isGroup = from.endsWith('@g.us');
            const isInbox = from.endsWith('@s.whatsapp.net');
            const recordMode = settings.recordMode || 'all'; 
            
            let shouldProceed = false;
            if (recordMode === 'all') shouldProceed = true;
            else if (recordMode === 'groups' && isGroup) shouldProceed = true;
            else if (recordMode === 'inbox' && isInbox) shouldProceed = true;

            if (!shouldProceed) return;

            // --- 🚥 30-SECOND RECORDING ENGINE ---
            
            // A. Subscribe to presence to ensure the update hits the target
            await sock.presenceSubscribe(from);
            
            // B. Start "recording" status
            await sock.sendPresenceUpdate('recording', from);
            
            console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sʏsᴛᴇᴍ* \n└────────────────────────┈\n\n│ 🎙️ sᴛᴀᴛᴜs: ʀᴇᴄᴏʀᴅɪɴɢ (30s)\n│ 👤 ᴛᴀʀɢᴇᴛ: ${from.split('@')[0]}\n│ ⚙ ᴍᴏᴅᴇ: ${recordMode.toUpperCase()}\n└────────────────────────┈`);
            
            // C. IMMERSIVE DELAY (Matched to your typing duration)
            await delay(30000);
            
            // D. Reset to Paused
            await sock.sendPresenceUpdate('paused', from);

        } catch (e) {
            // Safe catch for socket stability
        }
    }
};

export default recordingWorker;
