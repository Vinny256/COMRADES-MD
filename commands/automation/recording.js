const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: 'recording',
    category: 'automation',
    async execute(sock, m, args) {
        const remoteJid = m.key.remoteJid;
        const state = args[0]?.toLowerCase();
        if (!state) return sock.sendMessage(remoteJid, { text: "❌ *V_HUB:* Use `.recording on` or `.recording off`" });

        let settings = fs.readJsonSync(settingsFile);
        settings.recording = (state === 'on');
        if (settings.recording) settings.typing = false;
        fs.writeJsonSync(settingsFile, settings);
        
        return sock.sendMessage(remoteJid, { 
            text: `┏━━━━━ ✿ *V_HUB_AUTO* ✿ ━━━━━┓\n┃\n┃ ✅ *RECORDING:* ${settings.recording ? 'ENABLED' : 'DISABLED'}\n┃ ✍️ *TYPING:* ${settings.typing ? 'ENABLED' : 'DISABLED'}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });
    }
};