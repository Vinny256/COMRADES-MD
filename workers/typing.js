const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg, settings) => {
    try {
        // --- 🛡️ YOUR LOGIC PRESERVED ---
        // Only run if TYPING is enabled in your settings
        if (!settings.typing) return;

        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe;

        // Skip if message is from yourself or is a status update
        if (isMe || from === 'status@broadcast') return;

        // --- 🚥 10-SECOND TYPING ENGINE ---
        // 1. Subscribe to the presence of the sender
        await sock.presenceSubscribe(from);
        
        // 2. Start the "composing" (typing) status
        await sock.sendPresenceUpdate('composing', from);
        
        // Custom Vinnie Logging Style
        console.log(`✿ HUB_SYNC ✿ Status: TYPING (10s) | Target: ${from.split('@')[0]}`);
        
        // 3. WAIT FOR 10 SECONDS (Your specific requirement)
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // 4. Stop the typing status
        await sock.sendPresenceUpdate('paused', from);

    } catch (e) {
        // Keeps the queue moving even if the connection flickers
    }
};