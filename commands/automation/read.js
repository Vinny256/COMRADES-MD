import fs from 'fs-extra';
import path from 'path';

const settingsFile = './settings.json';

const readCommand = {
    name: "read",
    category: "automation",
    description: "Toggle auto-read (Blue Tick) automation",
    async execute(sock, msg, args, { from, isMe, settings }) {
        // --- 🛡️ OWNER-ONLY GUARD ---
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: `┌─『 ʜᴜʙ_sʏɴᴄ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ\n│ ⚙ *sᴛᴀᴛᴜs:* ᴄᴏᴍᴍᴀɴᴅᴇʀ ᴏɴʟʏ\n└────────────────────────┈` 
            }, { quoted: msg });
        }

        const param = args[0]?.toLowerCase();
        
        // --- ✦ UNICODE REACT ---
        await sock.sendMessage(from, { react: { text: "✦", key: msg.key } });

        if (param === 'on') {
            settings.bluetick = true;
        } else if (param === 'off') {
            settings.bluetick = false;
        } else {
            let statusMsg = `┌────────────────────────┈\n`;
            statusMsg += `│      *ᴀᴜᴛᴏ_ʀᴇᴀᴅ_ᴄᴏɴғɪɢ* \n`;
            statusMsg += `└────────────────────────┈\n\n`;
            statusMsg += `┌─『 sʏsᴛᴇᴍ sᴛᴀᴛᴇ 』\n`;
            statusMsg += `│ ⚙ *ᴍᴏᴅᴇ:* ${settings.bluetick ? 'ᴀᴄᴛɪᴠᴇ ✦' : 'ᴅɪsᴀʙʟᴇᴅ ✧'}\n`;
            statusMsg += `│ ⚙ *ᴜsᴀɢᴇ:* .ʀᴇᴀᴅ ᴏɴ | ᴏғғ\n`;
            statusMsg += `└────────────────────────┈\n\n`;
            statusMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            return sock.sendMessage(from, { text: statusMsg }, { quoted: msg });
        }

        // Save locally and sync to Cloud
        fs.writeJsonSync(settingsFile, settings);
        if (global.saveSettings) await global.saveSettings();

        let confirmation = `┌────────────────────────┈\n`;
        confirmation += `│      *ʜᴜʙ_sʏɴᴄ_sᴜᴄᴄᴇss* \n`;
        confirmation += `└────────────────────────┈\n\n`;
        confirmation += `┌─『 ᴜᴘᴅᴀᴛᴇ_ʟᴏɢ 』\n`;
        confirmation += `│ ⚙ *ᴀᴜᴛᴏ-ʀᴇᴀᴅ:* ${param === 'on' ? 'ᴇɴᴀʙʟᴇᴅ (ɪɴsᴛᴀɴᴛ)' : 'ᴅɪsᴀʙʟᴇᴅ'}\n`;
        confirmation += `│ ⚙ *sʏsᴛᴇᴍ:* sʏɴᴄ ᴄᴏᴍᴘʟᴇᴛᴇ\n`;
        confirmation += `└────────────────────────┈`;

        await sock.sendMessage(from, { text: confirmation }, { quoted: msg });
    }
};

export default readCommand;
