const autosaveCommand = {
    name: 'autosave',
    category: 'automation',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const senderNumber = (msg.key.participant || from).split('@')[0];
        const action = args[0]?.toLowerCase();

        // Initialize global Set if not exists
        global.optOutStatus = global.optOutStatus || new Set();

        // --- ⚡ UNICODE SLEEK STYLING ---
        if (action === 'off') {
            global.optOutStatus.add(senderNumber);
            
            let offMsg = `┌────────────────────────┈\n`;
            offMsg += `│      *ᴀᴜᴛᴏsᴀᴠᴇ_ᴅɪsᴀʙʟᴇᴅ* \n`;
            offMsg += `└────────────────────────┈\n\n`;
            offMsg += `┌─『 sʏsᴛᴇᴍ sᴛᴀᴛᴜs 』\n`;
            offMsg += `│ ⚙ *ᴍᴏᴅᴇ:* ᴏғғʟɪɴᴇ ✧\n`;
            offMsg += `│ ⚙ *ɪɴғᴏ:* sᴛᴀᴛᴜsᴇs ᴡɪʟʟ ɴᴏᴛ ʙᴇ sᴀᴠᴇᴅ\n`;
            offMsg += `└────────────────────────┈`;
            
            return sock.sendMessage(from, { text: offMsg });
        } 
        
        else if (action === 'on') {
            global.optOutStatus.delete(senderNumber);
            
            let onMsg = `┌────────────────────────┈\n`;
            onMsg += `│      *ᴀᴜᴛᴏsᴀᴠᴇ_ᴇɴᴀʙʟᴇᴅ* \n`;
            onMsg += `└────────────────────────┈\n\n`;
            onMsg += `┌─『 sʏsᴛᴇᴍ sᴛᴀᴛᴜs 』\n`;
            onMsg += `│ ⚙ *ᴍᴏᴅᴇ:* ᴀᴄᴛɪᴠᴇ ✦\n`;
            offMsg += `│ ⚙ *ɪɴғᴏ:* sᴛᴀᴛᴜs sᴀᴠɪɴɢ ʀᴇsᴜᴍᴇᴅ\n`;
            onMsg += `└────────────────────────┈\n\n`;
            onMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;
            
            return sock.sendMessage(from, { text: onMsg });
        } 
        
        else {
            let usage = `┌────────────────────────┈\n`;
            usage += `│      *ᴄᴏɴғɪɢ_ᴇʀʀ* \n`;
            usage += `└────────────────────────┈\n\n`;
            usage += `┌─『 ʜᴇʟᴘ_ʟᴏɢ 』\n`;
            usage += `│ ⚙ *ᴜsᴀɢᴇ:* .ᴀᴜᴛᴏsᴀᴠᴇ ᴏɴ / ᴏғғ\n`;
            usage += `└────────────────────────┈`;
            
            return sock.sendMessage(from, { text: usage });
        }
    }
};

export default autosaveCommand;
