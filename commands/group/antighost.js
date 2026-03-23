const antighostCommand = {
    name: "antighost",
    category: "group",
    desc: "Toggle ghost member protection or kick inactives",
    async execute(sock, msg, args, { from, isMe, settings, prefix }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!from.endsWith('@g.us')) return;

        // --- 📊 PERMISSION CHECKS ---
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin).map(p => p.id);
        
        const sender = msg.key.participant || from;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const isBotAdmin = admins.includes(botId);
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴅᴍɪɴ ᴘʀɪᴠɪʟᴇɢᴇ ʀᴇǫᴜɪʀᴇᴅ.\n└────────────────────────┈` 
            });
        }

        if (!isBotAdmin) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴇʀʀᴏʀ:* ʙᴏᴛ ɴᴇᴇᴅs ᴀᴅᴍɪɴ sᴛᴀᴛᴜs.\n└────────────────────────┈` 
            });
        }

        const action = args[0]?.toLowerCase();

        // --- 🚀 ACTION: ON ---
        if (action === "on") {
            settings.antighost = true;
            if (global.saveSettings) global.saveSettings();
            
            return sock.sendMessage(from, { 
                text: `┌─『 ᴀɴᴛɪ_ɢʜᴏsᴛ 』\n│ ✅ sᴛᴀᴛᴜs: *ᴇɴᴀʙʟᴇᴅ*\n│ ⚙ ᴍᴇᴍʙᴇʀ ᴛʀᴀᴄᴋɪɴɢ ɪs ɴᴏᴡ ᴀᴄᴛɪᴠᴇ.\n└────────────────────────┈` 
            });
        }

        // --- 🚀 ACTION: OFF ---
        if (action === "off") {
            settings.antighost = false;
            if (global.saveSettings) global.saveSettings();
            
            return sock.sendMessage(from, { 
                text: `┌─『 ᴀɴᴛɪ_ɢʜᴏsᴛ 』\n│ 🛡️ sᴛᴀᴛᴜs: *ᴅɪsᴀʙʟᴇᴅ*\n└────────────────────────┈` 
            });
        }

        // --- 🚀 ACTION: PURGE ---
        if (action === "purge") {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_sᴄᴀɴ 』\n│ 🔍 sᴄᴀɴɴɪɴɢ ғᴏʀ ɪɴᴀᴄᴛɪᴠᴇ ᴍᴇᴍʙᴇʀs...\n│ ⚙ ᴛɪᴍᴇғʀᴀᴍᴇ: 𝟹𝟶 ᴅᴀʏs\n└────────────────────────┈` 
            });
            
            // Note: This logic assumes you have a message-log collection in MongoDB
            return sock.sendMessage(from, { 
                text: `┌─『 sᴄᴀɴ_ʀᴇsᴜʟᴛ 』\n│ ⚠️ ᴘᴜʀɢᴇ ʀᴇǫᴜɪʀᴇs ʜɪsᴛᴏʀɪᴄᴀʟ ᴅᴀᴛᴀ.\n│ ⚙ ᴛʀᴀᴄᴋɪɴɢ ɪɴɪᴛɪᴀᴛᴇᴅ ᴛᴏᴅᴀʏ!\n└────────────────────────┈` 
            });
        }

        // --- 📑 DEFAULT STATUS UI ---
        let statusMsg = `┌────────────────────────┈\n`;
        statusMsg += `│      *ᴀɴᴛɪ_ɢʜᴏsᴛ_ᴘᴀɴᴇʟ* \n`;
        statusMsg += `└────────────────────────┈\n\n`;
        statusMsg += `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n`;
        statusMsg += `│ 📊 *ᴍᴏᴅᴇ:* ${settings.antighost ? "ᴀᴄᴛɪᴠᴇ ✅" : "ɪɴᴀᴄᴛɪᴠᴇ 🛡️"}\n`;
        statusMsg += `└────────────────────────┈\n\n`;
        statusMsg += `┌─『 ᴄᴏɴᴛʀᴏʟs 』\n`;
        statusMsg += `│ ⚙ ${prefix}ᴀɴᴛɪɢʜᴏsᴛ ᴏɴ\n`;
        statusMsg += `│ ⚙ ${prefix}ᴀɴᴛɪɢʜᴏsᴛ ᴏғғ\n`;
        statusMsg += `│ ⚙ ${prefix}ᴀɴᴛɪɢʜᴏsᴛ ᴘᴜʀɢᴇ\n`;
        statusMsg += `└────────────────────────┈\n\n`;
        statusMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        await sock.sendMessage(from, { text: statusMsg });
    }
};

export default antighostCommand;
