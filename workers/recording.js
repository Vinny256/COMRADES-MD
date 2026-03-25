import fs from 'fs-extra';

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: RECORDING_ENGINE (PRO)
 * Filename: recording.js
 */
const recordingWorker = {
    name: "recording_worker",
    async execute(sock, msg, settings) {
        try {
            const from = msg.key.remoteJid;
            const isMe = msg.key.fromMe;

            // 1. 🛡️ FILTERS
            if (!from || isMe || from === 'status@broadcast' || from.endsWith('@newsletter')) return;

            // 2. ⚡ COMMAND BYPASS
            const mtype = Object.keys(msg.message)[0];
            const textContent = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
            const prefix = process.env.PREFIX || ".";
            if (textContent.startsWith(prefix)) return;

            // 3. ⚙️ SETTINGS & SCOPE
            if (!settings.alwaysRecording) return;

            const isGroup = from.endsWith('@g.us');
            const isInbox = from.endsWith('@s.whatsapp.net');
            const recordMode = settings.recordMode || 'all'; 
            
            let shouldProceed = false;
            if (recordMode === 'all') shouldProceed = true;
            else if (recordMode === 'groups' && isGroup) shouldProceed = true;
            else if (recordMode === 'inbox' && isInbox) shouldProceed = true;

            if (!shouldProceed) return;

            // --- 🚥 30-SECOND NON-BLOCKING ENGINE ---
            
            // A. Subscribe & Start Recording status
            await sock.presenceSubscribe(from);
            await sock.sendPresenceUpdate('recording', from);
            
            console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sʏsᴛᴇᴍ* \n└────────────────────────┈\n\n│ 🎙️ sᴛᴀᴛᴜs: ʀᴇᴄᴏʀᴅɪɴɢ (30s)\n│ 👤 ᴛᴀʀɢᴇᴛ: ${from.split('@')[0]}\n│ ⚙ ᴍᴏᴅᴇ: ${recordMode.toUpperCase()}\n└────────────────────────┈`);
            
            // B. THE 30-SECOND "GHOST" TIMER
            // By NOT using 'await', the worker finishes in 0.1s.
            // The blue tick can now fire instantly!
            setTimeout(async () => {
                try {
                    await sock.sendPresenceUpdate('paused', from);
                } catch (e) { }
            }, 30000);

        } catch (e) { }
    }
};

export default recordingWorker;
