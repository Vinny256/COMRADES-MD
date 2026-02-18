const fs = require('fs-extra');

module.exports = {
    name: 'typing',
    category: 'automation',
    async execute(sock, m, args) {
        const remoteJid = m.key.remoteJid;
        const settingsFile = './settings.json';
        const state = args[0]?.toLowerCase(); // 'on' or 'off'

        if (!state) return sock.sendMessage(remoteJid, { text: "❌ *V_HUB:* Use `.typing on` or `.typing off`" });

        let settings = fs.readJsonSync(settingsFile);
        settings.typing = (state === 'on');
        
        // If typing is turned on, automatically turn off recording
        if (settings.typing) settings.recording = false;

        fs.writeJsonSync(settingsFile, settings);
        
        return sock.sendMessage(remoteJid, { 
            text: `┏━━━━━ ✿ *V_HUB_AUTO* ✿ ━━━━━┓\n┃\n┃ ✅ *TYPING:* ${settings.typing ? 'ENABLED' : 'DISABLED'}\n┃ 🎤 *RECORDING:* ${settings.recording ? 'ENABLED' : 'DISABLED'}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });
    }
};