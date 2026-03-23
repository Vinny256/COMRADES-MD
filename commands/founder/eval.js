import util from 'util';

const evalCommand = {
    name: "eval",
    category: "founder",
    desc: "V_HUB: Execute raw JS code",
    async execute(sock, msg, args, { from, isMe, settings, prefix }) {
        // --- 🛡️ ROOT-ONLY ACCESS ---
        if (!isMe) {
            return await sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ʀᴏᴏᴛ ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ\n│ ⚙ *sᴛᴀᴛᴜs:* ғᴏᴜɴᴅᴇʀ ᴘʀɪᴠɪʟᴇɢᴇ\n└────────────────────────┈` 
            });
        }

        const code = args.join(" ");
        if (!code) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ᴘʀᴏᴠɪᴅᴇ ᴄᴏᴅᴇ ᴛᴏ ᴇxᴇᴄᴜᴛᴇ.\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "💻", key: msg.key } });
        
        try {
            // Execute the raw JavaScript code
            let evaled = await eval(code);
            
            // Format the output for readability
            if (typeof evaled !== "string") {
                evaled = util.inspect(evaled, { depth: 1 });
            }

            let evalMsg = `┌────────────────────────┈\n`;
            evalMsg += `│      *ᴇxᴇᴄᴜᴛɪᴏɴ_ʟᴏɢ* \n`;
            evalMsg += `└────────────────────────┈\n\n`;
            evalMsg += `┌─『 ʀᴇsᴜʟᴛ 』\n`;
            evalMsg += `│ \`\`\`${evaled}\`\`\`\n`;
            evalMsg += `└────────────────────────┈\n\n`;
            evalMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: evalMsg }, { quoted: msg });

        } catch (err) {
            let errMsg = `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n`;
            errMsg += `│ ❌ *ʟᴏɢ:* ${err.message}\n`;
            errMsg += `└────────────────────────┈`;
            
            await sock.sendMessage(from, { text: errMsg }, { quoted: msg });
        }
    }
};

export default evalCommand;
