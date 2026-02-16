const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "autoreact",
    category: "automation",
    async execute(sock, msg, args, { from }) {
        if (!msg.key.fromMe) return;
        const settings = fs.readJsonSync(settingsFile);
        const action = args[0]?.toLowerCase();

        if (action === 'on' || action === 'off') {
            settings.autoreact = (action === 'on');
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { 
                text: `+--- [#] CONFIG_SYNC [#] ---+\n|\n|  SET: AUTO_REACT\n|  VAL: ${action.toUpperCase()}\n|\n+--- [*] V_DIGITAL_HUB [*] ---+` 
            });
        }
        await sock.sendMessage(from, { text: "| ❌ Use: .autoreact on/off" });
    }
};