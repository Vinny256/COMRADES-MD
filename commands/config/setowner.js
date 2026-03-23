import fs from 'fs-extra';

const settingsFile = './settings.json';

const setownerCommand = {
    name: "setowner",
    category: "config",
    desc: "Add a secondary owner number",
    async execute(sock, msg, args, { from, isMe }) {
        // 🛡️ SECURITY: Only the primary founder can delegate power
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴀᴄᴄᴇss_ᴅᴇɴɪᴇᴅ 』\n│ ⚙ *ʀᴇǫᴜɪʀᴇᴅ:* ғᴏᴜɴᴅᴇʀ ᴘʀɪᴠɪʟᴇɢᴇ\n└────────────────────────┈` 
            });
        }

        const target = args[0]?.replace(/[^0-9]/g, '');
        if (!target) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* .sᴇᴛᴏᴡɴᴇʀ 𝟸𝟻𝟺...\n└────────────────────────┈` 
            });
        }

        const newOwnerJid = target + "@s.whatsapp.net";

        // Load current settings
        let settings = {};
        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }

        // Ensure owners array exists
        if (!settings.owners) settings.owners = [];
        
        // Add if not already present
        if (!settings.owners.includes(newOwnerJid)) {
            settings.owners.push(newOwnerJid);
        }

        // --- 💾 SYNC TO LOCAL & CLOUD ---
        fs.writeJsonSync(settingsFile, settings, { spaces: 2 });
        if (global.saveSettings) await global.saveSettings();

        // --- ⚡ UNICODE SLEEK STYLING ---
        let confirmation = `┌────────────────────────┈\n`;
        confirmation += `│      *ᴏᴡɴᴇʀ_ᴅᴇʟᴇɢᴀᴛɪᴏɴ* \n`;
        confirmation += `└────────────────────────┈\n\n`;
        
        confirmation += `┌─『 ᴘʀɪᴠɪʟᴇɢᴇ ᴜᴘᴅᴀᴛᴇ 』\n`;
        confirmation += `│ ⚙ *ᴜsᴇʀ:* @${target}\n`;
        confirmation += `│ ⚙ *ʀᴏʟᴇ:* sᴇᴄᴏɴᴅᴀʀʏ_ᴀᴅᴍɪɴ\n`;
        confirmation += `│ ⚙ *sʏsᴛᴇᴍ:* sʏɴᴄᴇᴅ ᴛᴏ ᴄʟᴏᴜᴅ ✦\n`;
        confirmation += `└────────────────────────┈\n\n`;
        
        confirmation += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        await sock.sendMessage(from, { 
            text: confirmation, 
            mentions: [newOwnerJid] 
        }, { quoted: msg });
        
        console.log(`🚀 [V_HUB] New owner added: ${target}`);
    }
};

export default setownerCommand;
