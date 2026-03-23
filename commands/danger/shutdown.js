const shutdownCommand = {
    name: "shutdown",
    category: "danger",
    desc: "V_HUB: Emergency Stop",
    async execute(sock, msg, args, { from, isMe }) {
        // --- 🛡️ FOUNDER SHIELD ---
        if (!isMe) {
            return await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🛑", key: msg.key } });
        
        // --- ⚡ UNICODE SLEEK STYLING ---
        let shutdownMsg = `┌────────────────────────┈\n`;
        shutdownMsg += `│      *ɴᴜᴄʟᴇᴀʀ_sʜᴜᴛᴅᴏᴡɴ* \n`;
        shutdownMsg += `└────────────────────────┈\n\n`;
        
        shutdownMsg += `┌─『 ᴘʀᴏᴛᴏᴄᴏʟ_ᴀᴄᴛɪᴠᴇ 』\n`;
        shutdownMsg += `│ ⚙ *ᴛᴀʀɢᴇᴛ:* ᴍᴀɪɴ_ɢʀɪᴅ\n`;
        shutdownMsg += `│ ⚙ *sᴛᴀᴛᴜs:* ᴛᴇʀᴍɪɴᴀᴛɪɴɢ_ᴘʀᴏᴄᴇss\n`;
        shutdownMsg += `│ ⚙ *ᴘᴏᴡᴇʀ:* ᴄᴜᴛᴛɪɴɢ_ᴠᴏʟᴛᴀɢᴇ\n`;
        shutdownMsg += `└────────────────────────┈\n\n`;
        
        shutdownMsg += `_sʏsᴛᴇᴍ ᴏғғʟɪɴᴇ. ᴍᴀɴᴜᴀʟ ʙᴏᴏᴛ ʀᴇǫᴜɪʀᴇᴅ._`;

        await sock.sendMessage(from, { text: shutdownMsg });

        // --- ⚙️ TERMINATION DELAY ---
        // Allows the message buffer to clear before the process dies.
        setTimeout(() => {
            console.log(`🚀 [V_HUB] Emergency Shutdown executed by Founder.`);
            process.exit(1); 
        }, 3000);
    }
};

export default shutdownCommand;
