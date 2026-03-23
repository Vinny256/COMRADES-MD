import fs from 'fs-extra';

const settingsFile = './settings.json';

const modeCommand = {
    name: "mode",
    category: "config",
    desc: "Switch bot between public and private mode",
    async execute(sock, msg, args, { from, isMe }) {
        // 🛡️ SECURITY: Only the main owner can change the bot's core mode
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴀᴄᴄᴇss_ᴅᴇɴɪᴇᴅ 』\n│ ⚙ *ʀᴇǫᴜɪʀᴇᴅ:* ғᴏᴜɴᴅᴇʀ ᴘʀɪᴠɪʟᴇɢᴇ\n└────────────────────────┈` 
            });
        }
        
        // Load settings safely
        let settings = {};
        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }
        
        const newMode = args[0]?.toLowerCase();

        // --- ⚡ UNICODE SLEEK STYLING ---
        if (newMode === 'public' || newMode === 'private') {
            // 1. Update Memory & Local Storage
            settings.mode = newMode;
            fs.writeJsonSync(settingsFile, settings);
            
            // 2. Sync to MongoDB Cloud (Permanent for Heroku)
            if (global.saveSettings) await global.saveSettings();
            
            const modeStatus = newMode === 'public' ? 'ᴜɴʟᴏᴄᴋᴇᴅ ✦' : 'ʀᴇsᴛʀɪᴄᴛᴇᴅ ✧';
            
            let confirmation = `┌────────────────────────┈\n`;
            confirmation += `│      *ᴠ_ʜᴜʙ_ᴄᴏɴғɪɢ* \n`;
            confirmation += `└────────────────────────┈\n\n`;
            
            confirmation += `┌─『 sʏsᴛᴇᴍ sʏɴᴄ 』\n`;
            confirmation += `│ ⚙ *ᴍᴏᴅᴇ:* ${newMode.toUpperCase()}\n`;
            confirmation += `│ ⚙ *sᴛᴀᴛᴜs:* ${modeStatus}\n`;
            confirmation += `│ ⚙ *ᴄʟᴏᴜᴅ:* sʏɴᴄᴇᴅ ᴛᴏ ᴍᴏɴɢᴏᴅʙ\n`;
            confirmation += `└────────────────────────┈\n\n`;
            
            confirmation += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: confirmation });
            console.log(`🚀 [V_HUB] Mode changed to ${newMode} and synced to MongoDB.`);
            
        } else {
            // Usage Guide Dashboard
            let usage = `┌────────────────────────┈\n`;
            usage += `│      *sʏsᴛᴇᴍ_ʜᴇʟᴘ* \n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `┌─『 ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ 』\n`;
            usage += `│ ├─◈ .ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ\n`;
            usage += `│ ╰─◈ .ᴍᴏᴅᴇ ᴘʀɪᴠᴀᴛᴇ\n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `┌─『 ᴄᴜʀʀᴇɴᴛ sᴛᴀᴛᴇ 』\n`;
            usage += `│ ⚙ *ʙᴏᴛ_ᴍᴏᴅᴇ:* ${settings.mode?.toUpperCase() || 'ᴘʀɪᴠᴀᴛᴇ'}\n`;
            usage += `└────────────────────────┈`;

            await sock.sendMessage(from, { text: usage });
        }
    }
};

export default modeCommand;
