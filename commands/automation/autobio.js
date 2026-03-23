import fs from 'fs-extra';

const settingsFile = './settings.json';

const autobioCommand = {
    name: "autobio",
    category: "automation",
    desc: "Toggle 24-hour bio rotation",
    async execute(sock, msg, args, { from }) {
        // Restricted to Owner/Bot Number only
        if (!msg.key.fromMe) return;

        let settings = {};
        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }

        const action = args[0]?.toLowerCase();

        if (action === 'on' || action === 'off') {
            settings.autobio = (action === 'on');
            fs.writeJsonSync(settingsFile, settings);

            let confirmation = `┌────────────────────────┈\n`;
            confirmation += `│      *ʜᴜʙ_ᴄᴏɴғɪɢ* \n`;
            confirmation += `└────────────────────────┈\n\n`;
            
            confirmation += `┌─『 sʏsᴛᴇᴍ sʏɴᴄ 』\n`;
            confirmation += `│ ⚙ *ғᴇᴀᴛᴜʀᴇ:* ᴀᴜᴛᴏ_ʙɪᴏ\n`;
            confirmation += `│ ⚙ *sᴛᴀᴛᴜs:* ${action.toUpperCase()} ✦\n`;
            confirmation += `│ ⚙ *sʏɴᴄ:* sᴜᴄᴄᴇssғᴜʟ\n`;
            confirmation += `└────────────────────────┈\n\n`;
            
            confirmation += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            return sock.sendMessage(from, { text: confirmation });
        }

        // Error / Usage Message
        let errorMsg = `┌────────────────────────┈\n`;
        errorMsg += `│      *ᴄᴏɴғɪɢ_ᴇʀʀ* \n`;
        errorMsg += `└────────────────────────┈\n\n`;
        errorMsg += `┌─『 ʜᴇʟᴘ_ʟᴏɢ 』\n`;
        errorMsg += `│ ⚙ *ᴜsᴀɢᴇ:* .ᴀᴜᴛᴏʙɪᴏ ᴏɴ/ᴏғғ\n`;
        errorMsg += `└────────────────────────┈`;

        await sock.sendMessage(from, { text: errorMsg });
    }
};

export default autobioCommand;
