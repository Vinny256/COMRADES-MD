const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg, settings) => {
    try {
        // --- 🛡️ YOUR LOGIC PRESERVED ---
        // Only run if recording is ENABLED in your settings
        if (!settings.recording) return;

        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe;

        // Don't show "Recording" to yourself or on status
        if (isMe || from === 'status@broadcast') return;

        // --- 🚥 QUEUED PRESENCE ENGINE ---
        // This makes the bot show "Recording audio..." for 5 seconds
        await sock.presenceSubscribe(from);
        await sock.sendPresenceUpdate('recording', from);
        
        // Custom Vinnie Logging Style
        console.log(`✿ HUB_SYNC ✿ Status: RECORDING | Target: ${from.split('@')[0]}`);
        
        // Wait 5 seconds then stop (Standard human behavior)
        await new Promise(resolve => setTimeout(resolve, 5000));
        await sock.sendPresenceUpdate('paused', from);

    } catch (e) {
        // Keeps the queue moving even if network drops
    }
};