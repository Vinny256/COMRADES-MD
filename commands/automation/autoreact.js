const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "autoreact",
    category: "automation",
    description: "Manage Status Auto-Reaction",
    async execute(sock, msg, args, { from, prefix }) {
        let settings = fs.readJsonSync(settingsFile);
        
        // Ensure the structure exists
        if (!settings.status) settings.status = { autoReact: false, emoji: "✨" };

        const param = args[0]?.toLowerCase();

        const vStyle = (text) => `╭─── ~✾~ *VINNIE HUB* ~✾~ ───\n│\n${text}\n│\n╰─── ~✾~ *Status Grid* ~✾~ ───`;

        // Case: .autoreact on
        if (param === "on") {
            settings.status.autoReact = true;
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { text: vStyle(`│  🟢 *Auto-React:* ENABLED\n│  ✨ *Current Emoji:* ${settings.status.emoji}`) });
        }

        // Case: .autoreact off
        if (param === "off") {
            settings.status.autoReact = false;
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { text: vStyle(`│  🔴 *Auto-React:* DISABLED`) });
        }

        // Case: .autoreact emoji [target_emoji]
        if (param === "emoji" && args[1]) {
            settings.status.autoReact = true; // Auto-enable when setting emoji
            settings.status.emoji = args[1];
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { text: vStyle(`│  ✅ *New Emoji Set:* ${args[1]}\n│  🚀 *Auto-React:* ACTIVE`) });
        }

        // Usage Guide
        const usage = `│  💡 *Usage:* \n` +
                      `│  ◦  ${prefix}autoreact on / off\n` +
                      `│  ◦  ${prefix}autoreact emoji ❤️\n` +
                      `│\n` +
                      `│  *Current:* ${settings.status.autoReact ? 'ON' : 'OFF'} (${settings.status.emoji})`;
        
        return sock.sendMessage(from, { text: vStyle(usage) });
    }
};
