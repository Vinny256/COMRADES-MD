const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg, settings) => {
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
        // Checks if you want it on 'all', 'groups', or 'inbox'
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
        console.log(`✿ HUB_SYNC ✿ Status: RECORDING | Target: ${from.split('@')[0]} | Mode: ${recordMode}`);
        
        // Updated to 10 seconds per your request
        await new Promise(resolve => setTimeout(resolve, 10000));
        await sock.sendPresenceUpdate('paused', from);

    } catch (e) {
        // Keeps the queue moving even if network drops
    }
};
