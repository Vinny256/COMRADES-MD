const fs = require('fs-extra');
const path = require('path');
const settingsFile = './settings.json';

module.exports = {
    name: "typing",
    category: "automation",
    description: "Configure 10-second typing automation",
    async execute(sock, msg, args, { from, isMe, settings }) {
        // --- 🛡️ OWNER-ONLY GUARD ---
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: "✿ *HUB_SYNC* ✿\n\n❌ *Access Denied:* This configuration is restricted to the *Commander* only." 
            }, { quoted: msg });
        }

        const mode = args[0]?.toLowerCase();
        const validModes = ['all', 'groups', 'inbox', 'off'];

        // --- 🌸 VINNIE FLOWER REACT ---
        await sock.sendMessage(from, { react: { text: "✿", key: msg.key } });

        if (!mode || !validModes.includes(mode)) {
            return sock.sendMessage(from, { 
                text: `✿ *VINNIE HUB AUTOMATION* ✿\n\n*Current Mode:* ${settings.typingMode?.toUpperCase() || 'OFF'}\n\n*Where should I apply the typing effect?*\n\n1️⃣ *.typing all* (Everywhere)\n2️⃣ *.typing groups* (Groups only)\n3️⃣ *.typing inbox* (Private chats only)\n4️⃣ *.typing off* (Disable effect)` 
            }, { quoted: msg });
        }

        // Update settings object
        settings.typingMode = mode;

        // Save locally and sync to Cloud
        fs.writeJsonSync(settingsFile, settings);
        if (global.saveSettings) await global.saveSettings();

        await sock.sendMessage(from, { 
            text: `✿ *HUB_SYNC* ✿\n\n✅ *Typing Automation:* Now active for *${mode.toUpperCase()}*\n\n_Note: Commands and BlueTick actions bypass this 10s delay to stay fast._` 
        }, { quoted: msg });
    }
};
