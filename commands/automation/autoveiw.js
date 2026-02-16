const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "autoview",
    category: "automation",
    async execute(sock, msg, args, { from }) {
        if (!msg.key.fromMe) return;
        const settings = fs.readJsonSync(settingsFile);
        const action = args[0]?.toLowerCase();

        if (action === 'on' || action === 'off') {
            settings.autoview = (action === 'on');
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { 
                text: `+--- [#] CONFIG_SYNC [#] ---+\n|\n|  SET: AUTO_VIEW\n|  VAL: ${action.toUpperCase()}\n|\n+--- [*] V_DIGITAL_HUB [*] ---+` 
            });
        }
        await sock.sendMessage(from, { text: "| ❌ Use: .autoview on/off" });
    }
};