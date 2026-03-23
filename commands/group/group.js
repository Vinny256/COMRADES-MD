const groupControlCommand = {
    name: "group",
    category: "group",
    desc: "Open or close the group chat",
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

        const action = args[0]?.toLowerCase();

        // --- 🚀 ACTION: OPEN ---
        if (action === 'open') {
            await sock.sendMessage(from, { react: { text: "🔓", key: msg.key } });
            await sock.groupSettingUpdate(from, 'not_announcement');

            let openMsg = `┌────────────────────────┈\n`;
            openMsg += `│      *ɢʀᴏᴜᴘ_ᴜɴʟᴏᴄᴋᴇᴅ* \n`;
            openMsg += `└────────────────────────┈\n\n`;
            openMsg += `┌─『 sᴛᴀᴛᴜs_ᴜᴘᴅᴀᴛᴇ 』\n`;
            openMsg += `│ 🔓 *ᴍᴏᴅᴇ:* ᴘᴜʙʟɪᴄ_ᴀᴄᴄᴇss\n`;
            openMsg += `│ ⚙ *ᴀᴄᴛɪᴏɴ:* ᴍᴇssᴀɢɪɴɢ_ᴇɴᴀʙʟᴇᴅ\n`;
            openMsg += `│ 👮 *ᴀᴅᴍɪɴ:* @${sender.split('@')[0]}\n`;
            openMsg += `└────────────────────────┈\n\n`;
            openMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: openMsg, mentions: [sender] });

        // --- 🚀 ACTION: CLOSE ---
        } else if (action === 'close') {
            await sock.sendMessage(from, { react: { text: "🔒", key: msg.key } });
            await sock.groupSettingUpdate(from, 'announcement');

            let closeMsg = `┌────────────────────────┈\n`;
            closeMsg += `│      *ɢʀᴏᴜᴘ_ʟᴏᴄᴋᴇᴅ* \n`;
            closeMsg += `└────────────────────────┈\n\n`;
            closeMsg += `┌─『 sᴛᴀᴛᴜs_ᴜᴘᴅᴀᴛᴇ 』\n`;
            closeMsg += `│ 🔒 *ᴍᴏᴅᴇ:* ᴀᴅᴍɪɴ_ᴏɴʟʏ\n`;
            closeMsg += `│ ⚙ *ᴀᴄᴛɪᴏɴ:* ᴍᴇssᴀɢɪɴɢ_ʀᴇsᴛʀɪᴄᴛᴇᴅ\n`;
            closeMsg += `│ 👮 *ᴀᴅᴍɪɴ:* @${sender.split('@')[0]}\n`;
            closeMsg += `└────────────────────────┈\n\n`;
            closeMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: closeMsg, mentions: [sender] });

        } else {
            // --- 📑 USAGE UI ---
            let usageMsg = `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n`;
            usageMsg += `│ ⚙ ${prefix}ɢʀᴏᴜᴘ ᴏᴘᴇɴ\n`;
            usageMsg += `│ ⚙ ${prefix}ɢʀᴏᴜᴘ ᴄʟᴏsᴇ\n`;
            usageMsg += `└────────────────────────┈`;
            await sock.sendMessage(from, { text: usageMsg });
        }
    }
};

export default groupControlCommand;
