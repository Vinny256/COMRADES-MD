import fs from 'fs-extra';

const settingsFile = './settings.json';

const recordingCommand = {
    name: "recording",
    category: "automation",
    desc: "V_HUB: Toggle Recording Worker",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ FOUNDER SHIELD ---
        if (!isMe) {
            return await sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ\n│ ⚙ *sᴛᴀᴛᴜs:* ғᴏᴜɴᴅᴇʀ ᴏɴʟʏ\n└────────────────────────┈` 
            });
        }

        let settings = {};
        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }
        
        const choice = args[0]?.toLowerCase();

        // --- 🚥 MENU IF NO ARGS ---
        if (!choice) {
            await sock.sendMessage(from, { react: { text: "🎙️", key: msg.key } });

            let menu = `┌────────────────────────┈\n`;
            menu += `│      *ʀᴇᴄᴏʀᴅɪɴɢ_ʜᴜʙ* \n`;
            menu += `└────────────────────────┈\n\n`;
            
            menu += `┌─『 sʏsᴛᴇᴍ sᴛᴀᴛᴇ 』\n`;
            menu += `│ ⚙ *sᴛᴀᴛᴜs:* ${settings.alwaysRecording ? "ᴀᴄᴛɪᴠᴇ ✦" : "ᴏғғʟɪɴᴇ ✧"}\n`;
            menu += `│ ⚙ *ᴍᴏᴅᴇ:* ${settings.recordMode || "ᴀʟʟ"}\n`;
            menu += `└────────────────────────┈\n\n`;
            
            menu += `┌─『 ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ 』\n`;
            menu += `│ ├─◈ ${prefix}ʀᴇᴄᴏʀᴅɪɴɢ ᴀʟʟ\n`;
            menu += `│ ├─◈ ${prefix}ʀᴇᴄᴏʀᴅɪɴɢ ɢʀᴏᴜᴘs\n`;
            menu += `│ ├─◈ ${prefix}ʀᴇᴄᴏʀᴅɪɴɢ ɪɴʙᴏx\n`;
            menu += `│ ╰─◈ ${prefix}ʀᴇᴄᴏʀᴅɪɴɢ ᴏғғ\n`;
            menu += `└────────────────────────┈\n\n`;
            
            menu += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;
            
            return await sock.sendMessage(from, { text: menu });
        }

        // --- ⚙️ LOGIC ---
        if (choice === 'off') {
            settings.alwaysRecording = false;
        } else if (['all', 'groups', 'inbox'].includes(choice)) {
            settings.alwaysRecording = true;
            settings.recordMode = choice;
            settings.alwaysTyping = false; // Auto-disable typing to prioritize recording
        } else {
            return await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ᴜsᴇ: ᴀʟʟ, ɢʀᴏᴜᴘs, ɪɴʙᴏx, ᴏғғ\n└────────────────────────┈` 
            });
        }

        // Save and Sync
        fs.writeJsonSync(settingsFile, settings, { spaces: 2 });
        if (global.saveSettings) await global.saveSettings();

        // Success Feedback
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
        
        let successMsg = `┌────────────────────────┈\n`;
        successMsg += `│      *ʜᴜʙ_ᴜᴘᴅᴀᴛᴇᴅ* \n`;
        successMsg += `└────────────────────────┈\n\n`;
        
        successMsg += `┌─『 sʏɴᴄ ᴅᴇᴛᴀɪʟs 』\n`;
        successMsg += `│ ⚙ *ʀᴇᴄᴏʀᴅɪɴɢ:* ${settings.alwaysRecording ? "ᴀᴄᴛɪᴠᴇ ✦" : "ᴅɪsᴀʙʟᴇᴅ"}\n`;
        successMsg += `│ ⚙ *ᴛᴀʀɢᴇᴛ:* ${settings.recordMode?.toUpperCase() || "ɴᴏɴᴇ"}\n`;
        successMsg += `│ ⚙ *sʏsᴛᴇᴍ:* ᴄʟᴏᴜᴅ sʏɴᴄ ᴏᴋ\n`;
        successMsg += `└────────────────────────┈`;

        await sock.sendMessage(from, { text: successMsg });
    }
};

export default recordingCommand;
