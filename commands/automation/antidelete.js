import fs from 'fs-extra';
import path from 'path';

const settingsFile = './settings.json';

const antideleteCommand = {
    name: "antidelete",
    category: "automation",
    description: "Configure Anti-Delete behavior and routing",
    async execute(sock, msg, args, { from, prefix }) {
        // 1. Load Current Settings
        let settings = {};
        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }

        const mode = args[0]?.toLowerCase(); // all, groups, inbox, off
        const dest = args[1]?.toLowerCase(); // chat, inbox

        // --- ⚡ UNICODE SLEEK STYLING ---
        if (!mode || !['all', 'groups', 'inbox', 'off'].includes(mode)) {
            let usage = `┌────────────────────────┈\n`;
            usage += `│      *ᴀɴᴛɪᴅᴇʟᴇᴛᴇ_ᴄᴏɴғɪɢ* \n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `┌─『 sʏsᴛᴇᴍ ᴍᴏᴅᴇs 』\n`;
            usage += `│ ├─◈ *ᴀʟʟ* : ᴍᴏɴɪᴛᴏʀ ᴇᴠᴇʀʏᴡʜᴇʀᴇ\n`;
            usage += `│ ├─◈ *ɢʀᴏᴜᴘs* : ᴍᴏɴɪᴛᴏʀ ɢʀᴏᴜᴘs\n`;
            usage += `│ ├─◈ *ɪɴʙᴏx* : ᴍᴏɴɪᴛᴏʀ ᴅᴍs\n`;
            usage += `│ ╰─◈ *ᴏғғ* : ᴅɪsᴀʙʟᴇ sʏsᴛᴇᴍ\n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `┌─『 ᴅᴇsᴛɪɴᴀᴛɪᴏɴs 』\n`;
            usage += `│ ├─◈ *ᴄʜᴀᴛ* : ʀᴇsᴛᴏʀᴇ ʜᴇʀᴇ\n`;
            usage += `│ ╰─◈ *ɪɴʙᴏx* : ʀᴇsᴛᴏʀᴇ ᴛᴏ ᴅᴍ\n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `◈ *ᴜsᴀɢᴇ:* ${prefix}antidelete [ᴍᴏᴅᴇ] [ᴅᴇsᴛ]`;
            
            return sock.sendMessage(from, { text: usage }, { quoted: msg });
        }

        // 3. Update Settings
        settings.antidelete = {
            mode: mode,
            dest: dest && ['chat', 'inbox'].includes(dest) ? dest : (settings.antidelete?.dest || 'chat')
        };

        fs.writeJsonSync(settingsFile, settings);

        // 4. Success Reaction and Confirmation
        await sock.sendMessage(from, { react: { text: "🕵️‍♂️", key: msg.key } });

        let confirmation = `┌────────────────────────┈\n`;
        confirmation += `│      *ᴀɴᴛɪᴅᴇʟᴇᴛᴇ_sᴇᴛ* \n`;
        confirmation += `└────────────────────────┈\n\n`;
        
        confirmation += `┌─『 sᴛᴀᴛᴜs ᴜᴘᴅᴀᴛᴇ 』\n`;
        confirmation += `│ ⚙ *ᴍᴏᴅᴇ:* ${mode.toUpperCase()}\n`;
        confirmation += `│ ⚙ *ʀᴏᴜᴛɪɴɢ:* ${settings.antidelete.dest.toUpperCase()}\n`;
        confirmation += `│ ⚙ *sʏsᴛᴇᴍ:* ᴀᴄᴛɪᴠᴇ ✦\n`;
        confirmation += `└────────────────────────┈\n\n`;
        
        confirmation += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        return sock.sendMessage(from, { text: confirmation }, { quoted: msg });
    }
};

export default antideleteCommand;
