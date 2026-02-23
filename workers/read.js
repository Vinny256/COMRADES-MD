const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg) => {
    try {
        if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

        const currentSettings = fs.readJsonSync(settingsFile);
        if (!currentSettings.autoread) return;

        // 🕒 HUMAN JITTER: Wait 2-5 seconds before blue-ticking
        const delay = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
        await new Promise(res => setTimeout(res, delay));

        await sock.readMessages([msg.key]);
        
    } catch (err) { }
};