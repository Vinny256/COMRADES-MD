const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "autobio",
    category: "automation",
    desc: "Toggle 24-hour bio rotation",
    async execute(sock, msg, args, { from }) {
        if (!msg.key.fromMe) return;
        
        const settings = fs.readJsonSync(settingsFile);
        const action = args[0]?.toLowerCase();

        if (action === 'on' || action === 'off') {
            settings.autobio = (action === 'on');
            fs.writeJsonSync(settingsFile, settings);
            
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ HUB_CONFIG ✿ ━━━━━┓\n┃\n┃  FEATURE: AUTO_BIO\n┃  STATUS: ${action.toUpperCase()}\n┃  SYNC: SUCCESSFUL\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
            });
        }
        
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ CONFIG_ERR ✿ ━━━━━┓\n┃\n┃  USAGE: .autobio on/off\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛` 
        });
    }
};