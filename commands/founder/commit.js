import { exec } from 'child_process';

const commitCommand = {
    name: "commit",
    category: "founder",
    desc: "V_HUB: Git commit & push",
    async execute(sock, msg, args, { from, isMe }) {
        // --- 🛡️ FOUNDER SHIELD ---
        if (!isMe) {
            return await sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ\n│ ⚙ *sᴛᴀᴛᴜs:* ғᴏᴜɴᴅᴇʀ ᴏɴʟʏ\n└────────────────────────┈` 
            });
        }

        const message = args.join(" ") || "V_HUB Automated Update";

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🚀", key: msg.key } });

        // --- 🛠️ GIT EXECUTION ---
        exec(`git add . && git commit -m "${message}" && git push`, async (err, stdout, stderr) => {
            const output = stdout || stderr || "ɴᴏ_ᴏᴜᴛᴘᴜᴛ_ʀᴇᴄᴇɪᴠᴇᴅ";
            
            let gitMsg = `┌────────────────────────┈\n`;
            gitMsg += `│      *ɢɪᴛ_ᴘᴜsʜ_ᴅᴇᴘʟᴏʏ* \n`;
            gitMsg += `└────────────────────────┈\n\n`;
            
            gitMsg += `┌─『 ᴅᴇᴠᴏᴘs_ʟᴏɢ 』\n`;
            gitMsg += `│ ⚙ *ᴍᴇssᴀɢᴇ:* ${message}\n`;
            gitMsg += `│ ⚙ *sᴛᴀᴛᴜs:* ${err ? 'ғᴀɪʟᴇᴅ ❌' : 'sᴜᴄᴄᴇss ✅'}\n`;
            gitMsg += `└────────────────────────┈\n\n`;
            
            gitMsg += `*ᴏᴜᴛᴘᴜᴛ:*\n\`\`\`${output.slice(0, 500)}\`\`\`\n\n`;
            gitMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: gitMsg });
        });
    }
};

export default commitCommand;
