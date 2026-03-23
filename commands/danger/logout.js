const logoutCommand = {
    name: "logout",
    category: "danger",
    desc: "V_HUB PROTOCOL: Self-Termination",
    async execute(sock, msg, args, { from, isMe }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // --- 1. OWNER-ONLY ACCESS SHIELD ---
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *sᴛᴀᴛᴜs:* ᴜɴᴀᴜᴛʜᴏʀɪᴢᴇᴅ\n│ ⚙ *ᴜsᴇʀ:* @${sender.split('@')[0]}\n│ ⚙ *ᴀʟᴇʀᴛ:* sᴇʟғ-ᴅᴇsᴛʀᴜᴄᴛ ᴅᴇɴɪᴇᴅ\n└────────────────────────┈`, 
                mentions: [sender] 
            }, { quoted: msg });
        }

        // --- 2. TERMINATION SEQUENCE ---
        await sock.sendMessage(from, { react: { text: "🔌", key: msg.key } });
        
        let logoutMsg = `┌────────────────────────┈\n`;
        logoutMsg += `│      *sᴇʟғ_ᴛᴇʀᴍɪɴᴀᴛɪᴏɴ* \n`;
        logoutMsg += `└────────────────────────┈\n\n`;
        
        logoutMsg += `┌─『 ᴘʀᴏᴛᴏᴄᴏʟ_ᴀᴄᴛɪᴠᴇ 』\n`;
        logoutMsg += `│ ⚙ *ᴛᴀʀɢᴇᴛ:* ʟɪɴᴋᴇᴅ ᴅᴇᴠɪᴄᴇ\n`;
        logoutMsg += `│ ⚙ *sᴛᴀᴛᴜs:* ᴜɴʟɪɴᴋɪɴɢ_sᴇssɪᴏɴ\n`;
        logoutMsg += `│ ⚙ *ᴄᴏᴜɴᴛᴅᴏᴡɴ:* ᴇxᴇᴄᴜᴛɪɴɢ ɴᴏᴡ\n`;
        logoutMsg += `└────────────────────────┈\n\n`;
        
        logoutMsg += `_ᴜɴʟɪɴᴋɪɴɢ sᴇssɪᴏɴ... ɢᴏᴏᴅʙʏᴇ._`;

        await sock.sendMessage(from, { text: logoutMsg });

        // --- 3. EXECUTE LOGOUT ---
        try {
            await sock.logout(); 
            // Note: This effectively destroys the session tokens.
        } catch (e) {
            console.error("Logout Error:", e.message);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ sʜᴜᴛᴅᴏᴡɴ ᴘʀᴏᴛᴏᴄᴏʟ ғᴀɪʟᴇᴅ.\n└────────────────────────┈` 
            });
        }
    }
};

export default logoutCommand;
