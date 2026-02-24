const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "autoreact",
    category: "automation",
    description: "Configure status auto-reactions",
    async execute(sock, msg, args, { from, prefix }) {
        let settings = fs.readJsonSync(settingsFile);
        if (!settings.status) settings.status = { autoReact: false, emoji: "🤍" };

        const action = args[0]?.toLowerCase(); // on, off, set
        const emoji = args[1];

        const vStyle = (text) => `╭─── ~✾~ *VINNIE HUB* ~✾~ ───\n│\n${text}\n│\n╰─── ~✾~ *Status Grid* ~✾~ ───`;

        // 1. Toggle Logic
        if (action === "on") {
            settings.status.autoReact = true;
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { text: vStyle(`│  🟢 *Auto-React:* ENABLED\n│  ✨ *Current Emoji:* ${settings.status.emoji}`) });
        }

        if (action === "off") {
            settings.status.autoReact = false;
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { text: vStyle(`│  🔴 *Auto-React:* DISABLED`) });
        }

        // 2. Set Emoji Logic
        if (action === "set" && emoji) {
            settings.status.autoReact = true; // Auto-enable if setting a new emoji
            settings.status.emoji = emoji;
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { text: vStyle(`│  ✅ *New Emoji Set:* ${emoji}\n│  🚀 *Status Grid active.*`) });
        }

        // 3. Default Usage
        const usage = `│  💡 *Usage:* \n` +
                      `│  ◦  ${prefix}status on\n` +
                      `│  ◦  ${prefix}status off\n` +
                      `│  ◦  ${prefix}status set [emoji]`;
        
        return sock.sendMessage(from, { text: vStyle(usage) });
    }
};
