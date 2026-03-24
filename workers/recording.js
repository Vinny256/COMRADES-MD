import fs from 'fs-extra';
import { delay } from "@whiskeysockets/baileys";

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: RECORDING_ENGINE
 * Filename: recording.js
 * Logic: Always Recording | Target Filters | 10s Timer.
 */
const recordingWorker = {
    name: "recording_worker",
    async execute(sock, msg, settings) {
        try {
            // --- 🛡️ YOUR LOGIC PRESERVED ---
            // Only run if recording is ENABLED in your settings
            if (!settings.alwaysRecording) return;

            const from = msg.key.remoteJid;
            const isMe = msg.key.fromMe;
            const isGroup = from.endsWith('@g.us');
            const isInbox = from.endsWith('@s.whatsapp.net');

            // Don't show "Recording" to yourself or on status
            if (isMe || from === 'status@broadcast') return;

            // --- 🎯 TARGET FILTERS ---
            const recordMode = settings.recordMode || 'all'; 
            let shouldProceed = false;

            if (recordMode === 'all') shouldProceed = true;
            if (recordMode === 'groups' && isGroup) shouldProceed = true;
            if (recordMode === 'inbox' && isInbox) shouldProceed = true;

            if (!shouldProceed) return;

            // --- 🚥 QUEUED PRESENCE ENGINE ---
            await sock.presenceSubscribe(from);
            await sock.sendPresenceUpdate('recording', from);
            
            // Custom Vinnie Logging Style
            console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sʏsᴛᴇᴍ* \n└────────────────────────┈\n\n│ 🎙️ sᴛᴀᴛᴜs: ʀᴇᴄᴏʀᴅɪɴɢ\n│ 👤 ᴛᴀʀɢᴇᴛ: ${from.split('@')[0]}\n│ ⚙ ᴍᴏᴅᴇ: ${recordMode}\n└────────────────────────┈`);
            
            // Updated to 10 seconds per your request
            // Using Baileys native delay for memory safety on Heroku
            await delay(10000);
            await sock.sendPresenceUpdate('paused', from);

        } catch (e) {
            // Keeps the queue moving even if network drops
        }
    }
};

export default recordingWorker;
