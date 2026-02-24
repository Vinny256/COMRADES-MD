const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: 'autopromo',
    category: 'owner',
    desc: 'Toggle the hourly promotion system',
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;

        const settings = fs.readJsonSync(settingsFile);
        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            settings.autopromo = true;
            fs.writeJsonSync(settingsFile, settings);
            global.saveSettings(); // Sync to MongoDB
            return sock.sendMessage(from, { text: "✅ *Auto-Promo Enabled.* The bot will now cycle through groups every hour." });
        }

        if (action === 'off') {
            settings.autopromo = false;
            fs.writeJsonSync(settingsFile, settings);
            global.saveSettings(); // Sync to MongoDB
            return sock.sendMessage(from, { text: "🛑 *Auto-Promo Disabled.* Hourly messages stopped." });
        }

        sock.sendMessage(from, { text: `Current Status: *${settings.autopromo ? 'ON' : 'OFF'}*\nUse: \`.autopromo on\` or \`.autopromo off\`` });
    }
};