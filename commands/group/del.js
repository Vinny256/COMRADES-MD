const deleteCommand = {
    name: "del",
    category: "group",
    desc: "Delete a message by replying to it",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ GROUP-ONLY CHECK ---
        const isGroup = from.endsWith('@g.us');
        if (!isGroup) return;

        // --- 📊 PERMISSION CHECKS ---
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin).map(p => p.id);
        
        const sender = msg.key.participant || from;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const isBotAdmin = admins.includes(botId);
        const isAdmin = admins.includes(sender) || isMe;

        // --- 🛡️ SECURITY GATE ---
        if (!isAdmin) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴅᴍɪɴ ᴘʀɪᴠɪʟᴇɢᴇ ʀᴇǫᴜɪʀᴇᴅ.\n└────────────────────────┈` 
            });
        }

        // --- 📝 QUOTED MESSAGE VALIDATION ---
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        if (!quoted || !quoted.stanzaId) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴅᴇʟ [ʀᴇᴘʟʏ]\n│ ⚙ *ᴀɪᴍ:* ᴘᴜʀɢᴇ ᴛᴀʀɢᴇᴛ ᴍsɢ\n└────────────────────────┈` 
            });
        }

        // --- 🗑️ EXECUTION ---
        try {
            // Initial Reaction
            await sock.sendMessage(from, { react: { text: "🗑️", key: msg.key } });

            // Send Delete Protocol
            await sock.sendMessage(from, {
                delete: {
                    remoteJid: from,
                    fromMe: quoted.participant === botId,
                    id: quoted.stanzaId,
                    participant: quoted.participant
                }
            });

            // --- 📑 MODERATION LOG ---
            let delLog = `┌────────────────────────┈\n`;
            delLog += `│      *ᴍᴇssᴀɢᴇ_ᴘᴜʀɢᴇ* \n`;
            delLog += `└────────────────────────┈\n\n`;
            delLog += `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n`;
            delLog += `│ 🗑️ *ᴀᴄᴛɪᴏɴ:* ᴍᴇssᴀɢᴇ_ᴅᴇʟᴇᴛᴇᴅ\n`;
            delLog += `│ 👮 *ᴀᴅᴍɪɴ:* @${sender.split('@')[0]}\n`;
            delLog += `│ ⚙ *sᴛᴀᴛᴜs:* sᴜᴄᴄᴇss ✦\n`;
            delLog += `└────────────────────────┈\n\n`;
            delLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: delLog, mentions: [sender] });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${err.message}\n└────────────────────────┈` 
            });
        }
    }
};

export default deleteCommand;
