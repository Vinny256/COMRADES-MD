const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "mode",
    category: "config",
    desc: "Switch bot between public and private mode",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return sock.sendMessage(from, { text: "👑 Owner Only Command" });
        
        const settings = fs.readJsonSync(settingsFile);
        const newMode = args[0]?.toLowerCase();

        if (newMode === 'public' || newMode === 'private') {
            settings.mode = newMode;
            fs.writeJsonSync(settingsFile, settings);
            
            // Sync to Mongo if you have the logic in index.js to auto-save settings
            await sock.sendMessage(from, { text: `✿ MODE_UPDATED ✿\n┃ Status: SUCCESS\n┃ New Mode: *${newMode.toUpperCase()}*` });
        } else {
            await sock.sendMessage(from, { text: "┃ Usage: .mode public/private" });
        }
    }
};