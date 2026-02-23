const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg) => {
    try {
        // Skip if it's our own message or a status
        if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

        // Fresh read of settings
        const currentSettings = fs.readJsonSync(settingsFile);
        if (!currentSettings.autoread) return;

        // Mark as read (Blue Tick)
        await sock.readMessages([msg.key]);
        
    } catch (err) {
        // Silent catch to prevent interference with Queen Healer
    }
};