const promoteCommand = {
    name: "promote",
    category: "group",
    desc: "Give a member Admin privileges",
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

        // Remove duplicates and Bot safety
        users = [...new Set(users)].filter(u => u !== botId);

        if (!users.length) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴘʀᴏᴍᴏᴛᴇ [ʀᴇᴘʟʏ/ᴛᴀɢ]\n│ ⚙ *ᴀɪᴍ:* ᴇʟᴇᴠᴀᴛᴇ ᴀᴜᴛʜᴏʀɪᴛʏ\n└────────────────────────┈` 
            });
        }

        try {
            // --- 🚀 EXECUTION ---
            await sock.sendMessage(from, { react: { text: "👑", key: msg.key } });
            await sock.groupParticipantsUpdate(from, users, "promote");

            // --- 📑 MODERATION LOG ---
            let promoteLog = `┌────────────────────────┈\n`;
            promoteLog += `│      *ᴀᴜᴛʜᴏʀɪᴛʏ_ᴇʟᴇᴠᴀᴛᴇᴅ* \n`;
            promoteLog += `└────────────────────────┈\n\n`;
            promoteLog += `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n`;
            promoteLog += `│ 👑 *ᴀᴄᴛɪᴏɴ:* ᴘʀᴏᴍᴏᴛᴇ_sᴜᴄᴄᴇss\n`;
            promoteLog += `│ 👤 *ᴛᴀʀɢᴇᴛ(s):* ${users.length}\n`;
            promoteLog += `│ 👮 *ᴀᴅᴍɪɴ:* @${sender.split('@')[0]}\n`;
            promoteLog += `└────────────────────────┈\n\n`;
            promoteLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: promoteLog, 
                mentions: [sender, ...users] 
            });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${err.message}\n└────────────────────────┈` 
            });
        }
    }
};

export default promoteCommand;
