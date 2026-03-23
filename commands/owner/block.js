const blockCommand = {
    name: 'block',
    category: 'owner',
    desc: 'Block a user from WhatsApp',
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ FOUNDER-ONLY SHIELD ---
        if (!isMe) return;

        // --- 🎯 TARGET DETECTION ---
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
        let target = quoted || (args[0] && args[0].includes('@') ? args[0] : null);

        // Standardize JID if only numbers were provided
        if (!target && args[0] && /^\d+$/.test(args[0])) {
            target = args[0] + '@s.whatsapp.net';
        }

        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // --- 🛡️ SAFETY CHECKS ---
        if (!target) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ʙʟᴏᴄᴋ [ʀᴇᴘʟʏ/ᴊɪᴅ]\n│ ⚙ *ᴀɪᴍ:* ɢʟᴏʙᴀʟ_ʟᴏᴄᴋᴅᴏᴡɴ\n└────────────────────────┈` 
            });
        }

        if (target === botId) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ 』\n│ ⚠️ sᴇʟғ-ʙʟᴏᴄᴋ ᴘʀᴇᴠᴇɴᴛᴇᴅ.\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });

        try {
            // --- 🚀 EXECUTE BLOCK ---
            await sock.updateBlockStatus(target, "block");

            // --- 📑 LOCKDOWN LOG ---
            let blockLog = `┌────────────────────────┈\n`;
            blockLog += `│      *ᴠ-ʜᴜʙ_ʟᴏᴄᴋᴅᴏᴡɴ* \n`;
            blockLog += `└────────────────────────┈\n\n`;
            blockLog += `┌─『 sᴛᴀᴛᴜs_ʀᴇᴘᴏʀᴛ 』\n`;
            blockLog += `│ 🚫 *sᴛᴀᴛᴜs:* ᴜsᴇʀ_ʙʟᴏᴄᴋᴇᴅ\n`;
            blockLog += `│ 👤 *ᴛᴀʀɢᴇᴛ:* @${target.split('@')[0]}\n`;
            blockLog += `│ 🔒 *sᴄᴏᴘᴇ:* ɢʟᴏʙᴀʟ_ᴡʜᴀᴛsᴀᴘᴘ\n`;
            blockLog += `└────────────────────────┈\n\n`;
            blockLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: blockLog, 
                mentions: [target] 
            });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ᴜɴᴀʙʟᴇ ᴛᴏ ᴇxᴇᴄᴜᴛᴇ ʙʟᴏᴄᴋ.\n└────────────────────────┈` 
            });
        }
    }
};

export default blockCommand;
