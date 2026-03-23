import fs from 'fs-extra';

const settingsFile = './settings.json';

const autoreactCommand = {
    name: "autoreact",
    category: "automation",
    description: "Manage Status Auto-Reaction",
    async execute(sock, msg, args, { from, prefix }) {
        // Load settings safely
        let settings = {};
        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }
        
        // Ensure the structure exists
        if (!settings.status) settings.status = { autoReact: false, emoji: "✨" };

        const param = args[0]?.toLowerCase();

        // --- ⚡ UNICODE SLEEK STYLING ---
        // Case: .autoreact on
        if (param === "on") {
            settings.status.autoReact = true;
            fs.writeJsonSync(settingsFile, settings);
            
            let onMsg = `┌────────────────────────┈\n`;
            onMsg += `│      *ᴀᴜᴛᴏʀᴇᴀᴄᴛ_ᴇɴᴀʙʟᴇᴅ* \n`;
            onMsg += `└────────────────────────┈\n\n`;
            onMsg += `┌─『 sʏsᴛᴇᴍ sᴛᴀᴛᴜs 』\n`;
            onMsg += `│ ⚙ *ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ:* ᴀᴄᴛɪᴠᴇ ✦\n`;
            onMsg += `│ ⚙ *ᴇᴍᴏᴊɪ:* ${settings.status.emoji}\n`;
            onMsg += `└────────────────────────┈\n\n`;
            onMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;
            
            return sock.sendMessage(from, { text: onMsg });
        }

        // Case: .autoreact off
        if (param === "off") {
            settings.status.autoReact = false;
            fs.writeJsonSync(settingsFile, settings);
            
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
            settings.status.autoReact = true; // Auto-enable when setting emoji
            settings.status.emoji = args[1];
            fs.writeJsonSync(settingsFile, settings);
            
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
        usage += `│ ⚙ *ᴍᴏᴅᴇ:* ${settings.status.autoReact ? 'ᴏɴ ✦' : 'ᴏғғ ✧'}\n`;
        usage += `│ ⚙ *ᴇᴍᴏᴊɪ:* ${settings.status.emoji}\n`;
        usage += `└────────────────────────┈`;
        
        return sock.sendMessage(from, { text: usage });
    }
};

export default autoreactCommand;
