const setDescCommand = {
    name: "setdesc",
    category: "group",
    desc: "Change the group description",
    async execute(sock, msg, args, { from, isMe, prefix }) {
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

        // --- 📝 INPUT VALIDATION ---
        const newDesc = args.join(" ");
        if (!newDesc) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}sᴇᴛᴅᴇsᴄ [ᴛᴇxᴛ]\n│ ⚙ *ᴀɪᴍ:* ᴜᴘᴅᴀᴛᴇ ɢʀᴏᴜᴘ ɪɴғᴏ\n└────────────────────────┈` 
            });
        }

        try {
            // --- 🚀 EXECUTION ---
            await sock.sendMessage(from, { react: { text: "📝", key: msg.key } });
            await sock.groupUpdateDescription(from, newDesc);

            // --- 📑 MODERATION LOG ---
            let descLog = `┌────────────────────────┈\n`;
            descLog += `│      *ɢʀᴏᴜᴘ_ᴍᴇᴛᴀ_ᴜᴘᴅᴀᴛᴇ* \n`;
            descLog += `└────────────────────────┈\n\n`;
            descLog += `┌─『 sᴜᴄᴄᴇss 』\n`;
            descLog += `│ 👮 *ᴀᴅᴍɪɴ:* @${sender.split('@')[0]}\n`;
            descLog += `│ 📝 *sᴛᴀᴛᴜs:* ᴅᴇsᴄʀɪᴘᴛɪᴏɴ_ʟɪᴠᴇ\n`;
            descLog += `└────────────────────────┈\n\n`;
            descLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: descLog, 
                mentions: [sender] 
            });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${err.message}\n└────────────────────────┈` 
            });
        }
    }
};

export default setDescCommand;
