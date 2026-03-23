import fs from 'fs-extra';
import path from 'path';

const settingsFile = './settings.json';

const typingCommand = {
    name: "typing",
    category: "automation",
    description: "Configure 10-second typing automation",
    async execute(sock, msg, args, { from, isMe, settings }) {
        // --- 🛡️ OWNER-ONLY GUARD ---
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: `┌─『 ʜᴜʙ_sʏɴᴄ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ\n│ ⚙ *sᴛᴀᴛᴜs:* ᴄᴏᴍᴍᴀɴᴅᴇʀ ᴏɴʟʏ\n└────────────────────────┈` 
            }, { quoted: msg });
        }

        const mode = args[0]?.toLowerCase();
        const validModes = ['all', 'groups', 'inbox', 'off'];

        // --- ✦ UNICODE REACT ---
        await sock.sendMessage(from, { react: { text: "✦", key: msg.key } });

        if (!mode || !validModes.includes(mode)) {
            let usage = `┌────────────────────────┈\n`;
            usage += `│      *ᴛʏᴘɪɴɢ_ᴀᴜᴛᴏᴍᴀᴛɪᴏɴ* \n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `┌─『 ᴄᴜʀʀᴇɴᴛ sᴛᴀᴛᴇ 』\n`;
            usage += `│ ⚙ *ᴍᴏᴅᴇ:* ${settings.typingMode?.toUpperCase() || 'ᴏғғ ✧'}\n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `┌─『 ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ 』\n`;
            usage += `│ ├─◈ ${prefix}ᴛʏᴘɪɴɢ ᴀʟʟ\n`;
            usage += `│ ├─◈ ${prefix}ᴛʏᴘɪɴɢ ɢʀᴏᴜᴘs\n`;
            usage += `│ ├─◈ ${prefix}ᴛʏᴘɪɴɢ ɪɴʙᴏx\n`;
            usage += `│ ╰─◈ ${prefix}ᴛʏᴘɪɴɢ ᴏғғ\n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            return sock.sendMessage(from, { text: usage }, { quoted: msg });
        }

        // Update settings object
        settings.typingMode = mode;

        // Save locally and sync to Cloud
        fs.writeJsonSync(settingsFile, settings);
        if (global.saveSettings) await global.saveSettings();

        let confirmation = `┌────────────────────────┈\n`;
        confirmation += `│      *ʜᴜʙ_sʏɴᴄ_sᴜᴄᴄᴇss* \n`;
        confirmation += `└────────────────────────┈\n\n`;
        
        confirmation += `┌─『 ᴜᴘᴅᴀᴛᴇ_ʟᴏɢ 』\n`;
        confirmation += `│ ⚙ *ᴛʏᴘɪɴɢ:* ᴀᴄᴛɪᴠᴇ ғᴏʀ ${mode.toUpperCase()} ✦\n`;
        confirmation += `│ ⚙ *sʏsᴛᴇᴍ:* sʏɴᴄ ᴄᴏᴍᴘʟᴇᴛᴇ\n`;
        confirmation += `└────────────────────────┈\n\n`;
        
        confirmation += `_ɴᴏᴛᴇ: ᴄᴏᴍᴍᴀɴᴅs ʙʏᴘᴀss ᴛʜɪs ᴅᴇʟᴀʏ._`;

        await sock.sendMessage(from, { text: confirmation }, { quoted: msg });
    }
};

export default typingCommand;
