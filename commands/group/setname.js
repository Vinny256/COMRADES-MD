const setNameCommand = {
    name: "setname",
    category: "group",
    desc: "Change the group name",
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

        // --- ✏️ INPUT VALIDATION ---
        const newName = args.join(" ");
        if (!newName) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}sᴇᴛɴᴀᴍᴇ [ᴛᴇxᴛ]\n│ ⚙ *ᴀɪᴍ:* ᴜᴘᴅᴀᴛᴇ ɢʀᴏᴜᴘ sᴜʙᴊᴇᴄᴛ\n└────────────────────────┈` 
            });
        }

        if (newName.length > 25) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ʟɪᴍɪᴛ 』\n│ ⚙ *ᴇʀʀᴏʀ:* ɴᴀᴍᴇ ᴛᴏᴏ ʟᴏɴɢ!\n│ ⚠️ ᴍᴀx ᴄʜᴀʀᴀᴄᴛᴇʀs: 𝟸𝟻\n└────────────────────────┈` 
            });
        }

        try {
            // --- 🚀 EXECUTION ---
            await sock.sendMessage(from, { react: { text: "✏️", key: msg.key } });
            await sock.groupUpdateSubject(from, newName);

            // --- 📑 MODERATION LOG ---
            let nameLog = `┌────────────────────────┈\n`;
            nameLog += `│      *ɢʀᴏᴜᴘ_ᴍᴇᴛᴀ_ᴜᴘᴅᴀᴛᴇ* \n`;
            nameLog += `└────────────────────────┈\n\n`;
            nameLog += `┌─『 sᴜᴄᴄᴇss 』\n`;
            nameLog += `│ 👮 *ᴀᴅᴍɪɴ:* @${sender.split('@')[0]}\n`;
            nameLog += `│ 🏷️ *ɴᴇᴡ:* ${newName}\n`;
            nameLog += `│ ⚙ *sᴛᴀᴛᴜs:* sᴜʙᴊᴇᴄᴛ_ʟɪᴠᴇ\n`;
            nameLog += `└────────────────────────┈\n\n`;
            nameLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: nameLog, 
                mentions: [sender] 
            });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${err.message}\n└────────────────────────┈` 
            });
        }
    }
};

export default setNameCommand;
