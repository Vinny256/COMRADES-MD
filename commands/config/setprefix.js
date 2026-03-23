import fs from 'fs-extra';

const settingsFile = './settings.json';

const setprefixCommand = {
    name: "setprefix",
    category: "config",
    desc: "Change the bot command prefix",
    async execute(sock, msg, args, { from, isMe }) {
        // 🛡️ SECURITY: Only the primary founder can change the system trigger
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴀᴄᴄᴇss_ᴅᴇɴɪᴇᴅ 』\n│ ⚙ *ʀᴇǫᴜɪʀᴇᴅ:* ғᴏᴜɴᴅᴇʀ ᴘʀɪᴠɪʟᴇɢᴇ\n└────────────────────────┈` 
            });
        }

        const newPrefix = args[0];
        if (!newPrefix) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* .sᴇᴛᴘʀᴇғɪx [sʏᴍʙᴏʟ]\n│ ⚙ *ᴇx:* .sᴇᴛᴘʀᴇғɪx !\n└────────────────────────┈` 
            });
        }

        // Load current settings
        let settings = {};
        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }

        // Update Local & Global Memory
        settings.prefix = newPrefix;
        global.prefix = newPrefix; // Syncing the global listener variable

        // --- 💾 SYNC TO LOCAL & CLOUD ---
        fs.writeJsonSync(settingsFile, settings, { spaces: 2 });
        if (global.saveSettings) await global.saveSettings();

        // --- ⚡ UNICODE SLEEK STYLING ---
        let confirmation = `┌────────────────────────┈\n`;
        confirmation += `│      *ᴘʀᴇғɪx_ᴜᴘᴅᴀᴛᴇᴅ* \n`;
        confirmation += `└────────────────────────┈\n\n`;
        
        confirmation += `┌─『 sʏsᴛᴇᴍ sʏɴᴄ 』\n`;
        confirmation += `│ ⚙ *ɴᴇᴡ ᴘʀᴇғɪx:* [ ${newPrefix} ]\n`;
        confirmation += `│ ⚙ *sᴛᴀᴛᴜs:* ᴀᴄᴛɪᴠᴇ ✦\n`;
        confirmation += `│ ⚙ *ᴄʟᴏᴜᴅ:* sʏɴᴄᴇᴅ ᴛᴏ ᴍᴏɴɢᴏᴅʙ\n`;
        confirmation += `└────────────────────────┈\n\n`;
        
        confirmation += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        await sock.sendMessage(from, { text: confirmation }, { quoted: msg });
        
        console.log(`🚀 [V_HUB] Command prefix changed to: ${newPrefix}`);
    }
};

export default setprefixCommand;
