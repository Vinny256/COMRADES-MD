const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "autostatus",
    category: "automation",
    desc: "Toggle automatic status viewing",
    async execute(sock, msg, args, { from }) {
        // Only the Director (you) should control this
        const isDirector = msg.key.remoteJid.includes("254712345678"); // Replace with your number
        if (!isDirector && !msg.key.fromMe) return;

        const settings = fs.readJsonSync(settingsFile);
        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            settings.autoview = true;
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { 
                text: "+--- [#] AUTO_STATUS [#] ---+\n|\n|  STATUS: ENABLED\n|  MODE: BACKGROUND_VIEW\n|\n+--- [*] V_DIGITAL_HUB [*] ---+" 
            });
        } else if (action === 'off') {
            settings.autoview = false;
            fs.writeJsonSync(settingsFile, settings);
            return sock.sendMessage(from, { 
                text: "+--- [#] AUTO_STATUS [#] ---+\n|\n|  STATUS: DISABLED\n|\n+--- [*] V_DIGITAL_HUB [*] ---+" 
            });
        } else {
            return sock.sendMessage(from, { text: "| ❌ Use: .autostatus on/off" });
        }
    }
};