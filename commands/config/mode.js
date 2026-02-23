const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "mode",
    category: "config",
    desc: "Switch bot between public and private mode",
    async execute(sock, msg, args, { from, isMe }) {
        // 🛡️ SECURITY: Only the main owner can change the bot's core mode
        if (!isMe) return sock.sendMessage(from, { text: "👑 *Owner Access Required*" });
        
        const settings = fs.readJsonSync(settingsFile);
        const newMode = args[0]?.toLowerCase();

        if (newMode === 'public' || newMode === 'private') {
            // 1. Update Local Memory
            settings.mode = newMode;
            
            // 2. Save to Local File (Emergency Backup)
            fs.writeJsonSync(settingsFile, settings);
            
            // 3. Sync to MongoDB Cloud (Permanent for Heroku)
            await global.saveSettings();
            
            const statusEmoji = newMode === 'public' ? '🔓' : '🔐';
            
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *V_HUB CONFIG* ✿ ━━━━━┓\n┃\n┃  ${statusEmoji} MODE: *${newMode.toUpperCase()}*\n┃  STAT: *SYNCED TO CLOUD*\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
            
            console.log(`🚀 [V_HUB] Mode changed to ${newMode} and synced to MongoDB.`);
        } else {
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *HELP* ✿ ━━━━━┓\n┃\n┃  Usage: .mode public\n┃  Usage: .mode private\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        }
    }
};