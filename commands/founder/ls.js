import fs from 'fs';

const lsCommand = {
    name: "ls",
    category: "founder",
    desc: "V_HUB: List directory files",
    async execute(sock, msg, args, { from, isMe }) {
        // --- 🛡️ FOUNDER SHIELD ---
        if (!isMe) {
            return await sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ\n│ ⚙ *sᴛᴀᴛᴜs:* ғᴏᴜɴᴅᴇʀ ᴏɴʟʏ\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "📂", key: msg.key } });

        try {
            // Read the current directory
            const path = args[0] || './';
            const files = fs.readdirSync(path);
            
            // Map files with technical icons
            const list = files.map(f => {
                const isDir = fs.lstatSync(path + f).isDirectory();
                return isDir ? `📁 ${f}/` : `📄 ${f}`;
            }).join('\n');

            let lsMsg = `┌────────────────────────┈\n`;
            lsMsg += `│      *ᴅɪʀᴇᴄᴛᴏʀʏ_ᴇxᴘʟᴏʀᴇʀ* \n`;
            lsMsg += `└────────────────────────┈\n\n`;
            
            lsMsg += `┌─『 sʏsᴛᴇᴍ_ᴘᴀᴛʜ: ${path} 』\n`;
            lsMsg += `${list || '│ ⚙ ᴇᴍᴘᴛʏ_ᴅɪʀᴇᴄᴛᴏʀʏ'}\n`;
            lsMsg += `└────────────────────────┈\n\n`;
            
            lsMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: lsMsg }, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${err.message}\n└────────────────────────┈` 
            });
        }
    }
};

export default lsCommand;
