const kickCommand = {
    name: "kick",
    category: "group",
    desc: "Remove a member from the group",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!from.endsWith('@g.us')) return;

        // --- 📊 PERMISSION CHECKS ---
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin).map(p => p.id);
        
        const sender = msg.key.participant || from;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const owner = metadata.owner || "";
        
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
        if (args[0] && !users.length) {
            users.push(args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        }

        // --- 🛡️ SAFETY FILTER (No Self-Kick / No Owner Kick) ---
        users = [...new Set(users)].filter(u => u !== botId && u !== owner);

        if (!users.length) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴋɪᴄᴋ [ʀᴇᴘʟʏ/ᴛᴀɢ/ɴᴜᴍ]\n│ ⚙ *ᴀɪᴍ:* ᴘᴜʀɢᴇ ᴛᴀʀɢᴇᴛ ᴜsᴇʀ\n└────────────────────────┈` 
            });
        }

        try {
            // --- 🚀 EXECUTION ---
            await sock.sendMessage(from, { react: { text: "👞", key: msg.key } });
            await sock.groupParticipantsUpdate(from, users, "remove");

            // --- 📑 MODERATION LOG ---
            let kickLog = `┌────────────────────────┈\n`;
            kickLog += `│      *ᴍᴇᴍʙᴇʀ_ᴇxᴘᴜʟsɪᴏɴ* \n`;
            kickLog += `└────────────────────────┈\n\n`;
            kickLog += `┌─『 ᴘᴜʀɢᴇ_ʀᴇᴘᴏʀᴛ 』\n`;
            kickLog += `│ 👤 *ᴛᴀʀɢᴇᴛ(s):* ${users.length}\n`;
            kickLog += `│ 👮 *ᴀᴅᴍɪɴ:* @${sender.split('@')[0]}\n`;
            kickLog += `│ ⚙ *sᴛᴀᴛᴜs:* ᴇʟɪᴍɪɴᴀᴛᴇᴅ 👋\n`;
            kickLog += `└────────────────────────┈\n\n`;
            kickLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: kickLog, 
                mentions: [sender, ...users] 
            });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${err.message}\n└────────────────────────┈` 
            });
        }
    }
};

export default kickCommand;
