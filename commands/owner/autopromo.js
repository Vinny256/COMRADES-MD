import fs from 'fs-extra';

const settingsFile = './settings.json';

const autopromoCommand = {
    name: 'autopromo',
    category: 'owner',
    desc: 'Toggle the hourly promotion system',
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ FOUNDER-ONLY SHIELD ---
        if (!isMe) return;

        // --- 📊 FETCH SETTINGS ---
        const settings = fs.readJsonSync(settingsFile);
        const action = args[0]?.toLowerCase();

        // --- 🚀 ACTION: ON ---
        if (action === 'on') {
            settings.autopromo = true;
            fs.writeJsonSync(settingsFile, settings);
            
            // Sync to MongoDB if the global function exists
            if (global.saveSettings) global.saveSettings();
            
            return sock.sendMessage(from, { 
                text: `┌─『 ᴀᴜᴛᴏ_ᴘʀᴏᴍᴏ 』\n│ ✅ sᴛᴀᴛᴜs: *ᴇɴᴀʙʟᴇᴅ*\n│ ⚙ ʜᴏᴜʀʟʏ ᴄʏᴄʟᴇ ɪs ɴᴏᴡ ᴀᴄᴛɪᴠᴇ.\n└────────────────────────┈` 
            });
        }

        // --- 🚀 ACTION: OFF ---
        if (action === 'off') {
            settings.autopromo = false;
            fs.writeJsonSync(settingsFile, settings);
            
            if (global.saveSettings) global.saveSettings();
            
            return sock.sendMessage(from, { 
                text: `┌─『 ᴀᴜᴛᴏ_ᴘʀᴏᴍᴏ 』\n│ 🛑 sᴛᴀᴛᴜs: *ᴅɪsᴀʙʟᴇᴅ*\n│ ⚙ ʜᴏᴜʀʟʏ ᴍᴇssᴀɢᴇs ʜᴀᴠᴇ ʜᴀʟᴛᴇᴅ.\n└────────────────────────┈` 
            });
        }

        // --- 📑 DEFAULT STATUS UI ---
        let statusMsg = `┌────────────────────────┈\n`;
        statusMsg += `│      *ᴀᴜᴛᴏ_ᴘʀᴏᴍᴏ_ᴘᴀɴᴇʟ* \n`;
        statusMsg += `└────────────────────────┈\n\n`;
        statusMsg += `┌─『 sʏsᴛᴇᴍ_ʟᴏɢ 』\n`;
        statusMsg += `│ 📊 *ᴍᴏᴅᴇ:* ${settings.autopromo ? "ᴀᴄᴛɪᴠᴇ ✅" : "ɪɴᴀᴄᴛɪᴠᴇ 🛑"}\n`;
        statusMsg += `└────────────────────────┈\n\n`;
        statusMsg += `┌─『 ᴄᴏɴᴛʀᴏʟs 』\n`;
        statusMsg += `│ ⚙ ${prefix}ᴀᴜᴛᴏᴘʀᴏᴍᴏ ᴏɴ\n`;
        statusMsg += `│ ⚙ ${prefix}ᴀᴜᴛᴏᴘʀᴏᴍᴏ ᴏғғ\n`;
        statusMsg += `└────────────────────────┈\n\n`;
        statusMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        await sock.sendMessage(from, { text: statusMsg });
    }
};

export default autopromoCommand;
