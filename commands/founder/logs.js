import { exec } from 'child_process';

const logsCommand = {
    name: "logs",
    category: "founder",
    desc: "V_HUB: View server logs",
    async execute(sock, msg, args, { from, isMe }) {
        // --- 🛡️ FOUNDER SHIELD ---
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ\n│ ⚙ *sᴛᴀᴛᴜs:* ғᴏᴜɴᴅᴇʀ ᴏɴʟʏ\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "📜", key: msg.key } });

        // --- 🛠️ LOG EXTRACTION ---
        // Attempts to read the last 20 lines of common log files
        const logQuery = 'tail -n 20 /app/.logs 2>/dev/null || tail -n 20 logs.txt 2>/dev/null || echo "ɴᴏ_ʟᴏɢ_ғɪʟᴇ_ᴅᴇᴛᴇᴄᴛᴇᴅ"';
        
        exec(logQuery, async (err, stdout, stderr) => {
            const output = stdout || stderr || "sʏsᴛᴇᴍ_ʟᴏɢs_ᴇᴍᴘᴛʏ";
            
            let logMsg = `┌────────────────────────┈\n`;
            logMsg += `│      *sʏsᴛᴇᴍ_ʀᴜɴᴛɪᴍᴇ_ʟᴏɢs* \n`;
            logMsg += `└────────────────────────┈\n\n`;
            
            logMsg += `┌─『 ᴅᴇʙᴜɢ_ᴏᴜᴛᴘᴜᴛ 』\n`;
            logMsg += `│ \`\`\`${output.trim()}\`\`\`\n`;
            logMsg += `└────────────────────────┈\n\n`;
            
            logMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: logMsg });
        });
    }
};

export default logsCommand;
