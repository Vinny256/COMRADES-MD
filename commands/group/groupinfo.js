const groupInfoCommand = {
    name: "groupinfo",
    category: "group",
    desc: "Get detailed group information",
    async execute(sock, msg, args, { from, prefix }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!from.endsWith('@g.us')) return;

        // --- 📊 FETCH METADATA ---
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin || p.isSuperAdmin);
        const owner = metadata.owner || (participants.find(p => p.admin === 'superadmin')?.id) || "ᴜɴᴋɴᴏᴡɴ";

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "📊", key: msg.key } });

        // --- 📑 AUDIT UI CONSTRUCTION ---
        let infoMsg = `┌────────────────────────┈\n`;
        infoMsg += `│      *ɢʀᴏᴜᴘ_ᴀᴜᴅɪᴛ_ʟᴏɢ* \n`;
        infoMsg += `└────────────────────────┈\n\n`;
        
        infoMsg += `┌─『 ᴍᴇᴛᴀᴅᴀᴛᴀ 』\n`;
        infoMsg += `│ 🏷️ *ɴᴀᴍᴇ:* ${metadata.subject}\n`;
        infoMsg += `│ 🆔 *ᴊɪᴅ:* ${from.split('@')[0]}\n`;
        infoMsg += `│ 👑 *ᴏᴡɴᴇʀ:* @${owner.split('@')[0]}\n`;
        infoMsg += `│ 👥 *ᴍᴇᴍʙᴇʀs:* ${participants.length}\n`;
        infoMsg += `│ 👮 *ᴀᴅᴍɪɴs:* ${admins.length}\n`;
        infoMsg += `│ 📅 *ᴄʀᴇᴀᴛᴇᴅ:* ${new Date(metadata.creation * 1000).toLocaleDateString()}\n`;
        infoMsg += `└────────────────────────┈\n\n`;
        
        infoMsg += `┌─『 ᴅᴇsᴄʀɪᴘᴛɪᴏɴ 』\n`;
        infoMsg += `│ 📝 ${metadata.desc ? metadata.desc.toString() : "ɴᴏ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ sᴇᴛ."}\n`;
        infoMsg += `└────────────────────────┈\n\n`;
        
        infoMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        // --- 🚀 DISPATCH WITH OWNER MENTION ---
        await sock.sendMessage(from, { 
            text: infoMsg, 
            mentions: [owner],
            contextInfo: {
                externalAdReply: {
                    title: "ᴠ_ʜᴜʙ ɢʀᴏᴜᴘ ɪɴsɪɢʜᴛs",
                    body: metadata.subject,
                    thumbnailUrl: await sock.profilePictureUrl(from, 'image').catch(() => null),
                    sourceUrl: "https://github.com/vinnie-hub",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: msg });
    }
};

export default groupInfoCommand;
