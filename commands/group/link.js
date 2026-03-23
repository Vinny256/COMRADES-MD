const linkCommand = {
    name: "link",
    category: "group",
    desc: "Get the group invite link",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!from.endsWith('@g.us')) return;

        // --- 📊 PERMISSION CHECKS ---
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin).map(p => p.id);
        
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = admins.includes(botId);

        if (!isBotAdmin) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴇʀʀᴏʀ:* ʙᴏᴛ ɴᴇᴇᴅs ᴀᴅᴍɪɴ sᴛᴀᴛᴜs.\n│ 💡 ᴛᴏ ɢᴇɴᴇʀᴀᴛᴇ ᴀɴ ɪɴᴠɪᴛᴇ ʟɪɴᴋ.\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🔗", key: msg.key } });

        try {
            // --- 🚀 FETCH INVITE CODE ---
            const code = await sock.groupInviteCode(from);
            const inviteUrl = `https://chat.whatsapp.com/${code}`;

            // --- 📑 PREMIUM LINK UI ---
            let linkMsg = `┌────────────────────────┈\n`;
            linkMsg += `│      *ɢʀᴏᴜᴘ_ɪɴᴠɪᴛᴇ_ʟᴏɢ* \n`;
            linkMsg += `└────────────────────────┈\n\n`;
            linkMsg += `┌─『 ᴀᴄᴄᴇss_ᴘᴏʀᴛᴀʟ 』\n`;
            linkMsg += `│ 🏷️ *ɴᴀᴍᴇ:* ${metadata.subject}\n`;
            linkMsg += `│ 🖇️ *ʟɪɴᴋ:* \n`;
            linkMsg += `│ ${inviteUrl}\n`;
            linkMsg += `└────────────────────────┈\n\n`;
            linkMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: linkMsg,
                contextInfo: {
                    externalAdReply: {
                        title: "ᴠ_ʜᴜʙ ɪɴᴠɪᴛᴇ ᴘᴀss",
                        body: "ᴄʟɪᴄᴋ ᴛᴏ ᴊᴏɪɴ ᴛʜᴇ ᴄᴏᴍᴍᴜɴɪᴛʏ",
                        thumbnailUrl: await sock.profilePictureUrl(from, 'image').catch(() => null),
                        sourceUrl: inviteUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${err.message}\n└────────────────────────┈` 
            });
        }
    }
};

export default linkCommand;
