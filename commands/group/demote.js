const demoteCommand = {
    name: "demote",
    category: "group",
    desc: "Remove Admin privileges from a user",
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

        // --- 🎯 TARGET DETECTION ---
        let users = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            users.push(msg.message.extendedTextMessage.contextInfo.participant);
        }

        // Remove duplicates and Bot/Owner safety
        users = [...new Set(users)].filter(u => u !== botId);

        if (!users.length) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴅᴇᴍᴏᴛᴇ [ʀᴇᴘʟʏ/ᴛᴀɢ]\n│ ⚙ *ᴀɪᴍ:* ʀᴇᴠᴏᴋᴇ ᴀᴅᴍɪɴ ᴘᴏᴡᴇʀs\n└────────────────────────┈` 
            });
        }

        try {
            // --- 🚀 EXECUTION ---
            await sock.sendMessage(from, { react: { text: "🎖️", key: msg.key } });
            await sock.groupParticipantsUpdate(from, users, "demote");

            // --- 📑 MODERATION LOG ---
            let demoteLog = `┌────────────────────────┈\n`;
            demoteLog += `│      *ᴀᴜᴛʜᴏʀɪᴛʏ_ʀᴇᴠᴏᴋᴇᴅ* \n`;
            demoteLog += `└────────────────────────┈\n\n`;
            demoteLog += `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n`;
            demoteLog += `│ 🎖️ *ᴀᴄᴛɪᴏɴ:* ᴅᴇᴍᴏᴛᴇ_sᴜᴄᴄᴇss\n`;
            demoteLog += `│ 👤 *ᴛᴀʀɢᴇᴛ(s):* ${users.length}\n`;
            demoteLog += `│ 👮 *ᴀᴅᴍɪɴ:* @${sender.split('@')[0]}\n`;
            demoteLog += `└────────────────────────┈\n\n`;
            demoteLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: demoteLog, 
                mentions: [sender, ...users] 
            });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${err.message}\n└────────────────────────┈` 
            });
        }
    }
};

export default demoteCommand;
