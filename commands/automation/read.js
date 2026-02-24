const fs = require('fs-extra');
const path = require('path');
const settingsFile = './settings.json';

module.exports = {
    name: "read",
    category: "automation",
    description: "Toggle auto-read (Blue Tick) automation",
    async execute(sock, msg, args, { from, isMe, settings }) {
        // --- 🛡️ OWNER-ONLY GUARD ---
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: "✿ *HUB_SYNC* ✿\n\n❌ *Access Denied:* This command is restricted to the *Commander* only." 
            }, { quoted: msg });
        }

        const param = args[0]?.toLowerCase();
        
        // --- 🌸 VINNIE FLOWER REACT ---
        await sock.sendMessage(from, { react: { text: "✿", key: msg.key } });

        if (param === 'on') {
            settings.bluetick = true;
        } else if (param === 'off') {
            settings.bluetick = false;
        } else {
            return sock.sendMessage(from, { 
                text: `✿ *VINNIE HUB AUTOMATION* ✿\n\n*Current Status:* ${settings.bluetick ? 'ACTIVE ✅' : 'DISABLED ❌'}\n*Usage:* .read on | off` 
            }, { quoted: msg });
        }

        // Save locally and sync to Cloud
        fs.writeJsonSync(settingsFile, settings);
        if (global.saveSettings) await global.saveSettings();

        await sock.sendMessage(from, { 
            text: `✿ *HUB_SYNC* ✿\n\n✅ *Auto-Read:* ${param === 'on' ? 'Enabled (Instant Blue Tick)' : 'Disabled'}` 
        }, { quoted: msg });
    }
};
