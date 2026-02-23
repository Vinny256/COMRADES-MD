const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg) => {
    try {
        // Skip if from bot, from status, or if it's a protocol/delete message
        if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast' || msg.message?.protocolMessage) return;

        const currentSettings = fs.readJsonSync(settingsFile);
        if (!currentSettings.autoread) return;

        // 🕒 HUMAN JITTER: Wait 2-5 seconds so it looks like a person is reading
        const delay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
        await new Promise(res => setTimeout(res, delay));

        await sock.readMessages([msg.key]);
        
    } catch (err) {
        // Silent catch keeps the bot running smoothly
    }
};