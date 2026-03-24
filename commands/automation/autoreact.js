import fs from 'fs-extra';

const settingsFile = './settings.json';

const autoreactCommand = {
    name: "autoreact",
    category: "automation",
    description: "Manage Status Auto-Reaction",
    async execute(sock, msg, args, { from, prefix }) {
        // 1. Load settings safely
        let settings = {};
        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }
        
        const param = args[0]?.toLowerCase();

        // --- ⚡ SYNCED WITH INDEX.JS LOGIC ---
        
        // Case: .autoreact on
        if (param === "on") {
            settings.autoreact = true; // Match index.js key
            fs.writeJsonSync(settingsFile, settings);
            if (global.saveSettings) await global.saveSettings(); // Sync to Cloud
            
            let onMsg = `┌────────────────────────┈\n`;
            onMsg += `│      *ᴀᴜᴛᴏʀᴇᴀᴄᴛ_ᴇɴᴀʙʟᴇᴅ* \n`;
            onMsg += `└────────────────────────┈\n\n`;
            onMsg += `┌─『 sʏsᴛᴇᴍ sᴛᴀᴛᴜs 』\n`;
            onMsg += `│ ⚙ *ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ:* ᴀᴄᴛɪᴠᴇ ✦\n`;
            onMsg += `│ ⚙ *ᴇᴍᴏᴊɪ:* ${settings.statusEmoji || "✨"}\n`;
            onMsg += `└────────────────────────┈\n\n`;
            onMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;
            
            return sock.sendMessage(from, { text: onMsg });
        }

        // Case: .autoreact off
        if (param === "off") {
            settings.autoreact = false;
            fs.writeJsonSync(settingsFile, settings);
            if (global.saveSettings) await global.saveSettings();
            
            let offMsg = `┌────────────────────────┈\n`;
            offMsg += `│      *ᴀᴜᴛᴏʀᴇᴀᴄᴛ_ᴅɪsᴀʙʟᴇᴅ* \n`;
            offMsg += `└────────────────────────┈\n\n`;
            offMsg += `┌─『 sʏsᴛᴇᴍ sᴛᴀᴛᴜs 』\n`;
            offMsg += `│ ⚙ *ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ:* ᴏғғʟɪɴᴇ ✧\n`;
            offMsg += `└────────────────────────┈`;
            
            return sock.sendMessage(from, { text: offMsg });
        }

        // Case: .autoreact emoji [target_emoji]
        if (param === "emoji" && args[1]) {
            settings.autoreact = true; 
            settings.statusEmoji = args[1]; // Match index.js key
            fs.writeJsonSync(settingsFile, settings);
            if (global.saveSettings) await global.saveSettings();
            
            let emoMsg = `┌────────────────────────┈\n`;
            emoMsg += `│      *ᴇᴍᴏᴊɪ_ᴜᴘᴅᴀᴛᴇᴅ* \n`;
            emoMsg += `└────────────────────────┈\n\n`;
            emoMsg += `┌─『 ᴄᴏɴғɪɢ ᴅᴇᴛᴀɪʟs 』\n`;
            emoMsg += `│ ⚙ *ɴᴇᴡ ᴇᴍᴏᴊɪ:* ${args[1]}\n`;
            emoMsg += `│ ⚙ *ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ:* ᴀᴄᴛɪᴠᴇ ✦\n`;
            emoMsg += `└────────────────────────┈`;
            
            return sock.sendMessage(from, { text: emoMsg });
        }

        // Usage Guide (The Dashboard)
        let usage = `┌────────────────────────┈\n`;
        usage += `│      *sᴛᴀᴛᴜs_ɢʀɪᴅ* \n`;
        usage += `└────────────────────────┈\n\n`;
        
        usage += `┌─『 ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ 』\n`;
        usage += `│ ├─◈ ${prefix}ᴀᴜᴛᴏʀᴇᴀᴄᴛ ᴏɴ / ᴏғғ\n`;
        usage += `│ ╰─◈ ${prefix}ᴀᴜᴛᴏʀᴇᴀᴄᴛ ᴇᴍᴏᴊɪ [📩]\n`;
        usage += `└────────────────────────┈\n\n`;
        
        usage += `┌─『 ᴄᴜʀʀᴇɴᴛ sᴛᴀᴛᴇ 』\n`;
        usage += `│ ⚙ *ᴍᴏᴅᴇ:* ${settings.autoreact ? 'ᴏɴ ✦' : 'ᴏғғ ✧'}\n`;
        usage += `│ ⚙ *ᴇᴍᴏᴊɪ:* ${settings.statusEmoji || "✨"}\n`;
        usage += `└────────────────────────┈`;
        
        return sock.sendMessage(from, { text: usage });
    }
};

export default autoreactCommand;
