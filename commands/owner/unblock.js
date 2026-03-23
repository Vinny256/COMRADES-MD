const unblockCommand = {
    name: 'unblock',
    category: 'owner',
    desc: 'Unblock a user on WhatsApp',
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ FOUNDER-ONLY SHIELD ---
        if (!isMe) return;

        // --- 🎯 TARGET DETECTION ---
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
        let target = quoted || (args[0] && args[0].includes('@') ? args[0] : null);

        // Standardize JID if only a number was provided in args
        if (!target && args[0] && /^\d+$/.test(args[0])) {
            target = args[0] + '@s.whatsapp.net';
        }

        // --- 🛡️ USAGE CHECK ---
        if (!target) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴜɴʙʟᴏᴄᴋ [ʀᴇᴘʟʏ/ᴊɪᴅ]\n│ ⚙ *ᴀɪᴍ:* ᴀᴄᴄᴇss_ʀᴇsᴛᴏʀᴀᴛɪᴏɴ\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

        try {
            // --- 🚀 EXECUTE UNBLOCK ---
            await sock.updateBlockStatus(target, "unblock");

            // --- 📑 RESTORATION LOG ---
            let restoreLog = `┌────────────────────────┈\n`;
            restoreLog += `│      *ᴠ-ʜᴜʙ_ᴀᴄᴄᴇss_ʟᴏɢ* \n`;
            restoreLog += `└────────────────────────┈\n\n`;
            restoreLog += `┌─『 sᴛᴀᴛᴜs_ʀᴇᴘᴏʀᴛ 』\n`;
            restoreLog += `│ ✅ *sᴛᴀᴛᴜs:* ᴜsᴇʀ_ᴜɴʙʟᴏᴄᴋᴇᴅ\n`;
            restoreLog += `│ 👤 *ᴛᴀʀɢᴇᴛ:* @${target.split('@')[0]}\n`;
            restoreLog += `│ 🔓 *ɴᴏᴛɪᴄᴇ:* ᴀᴄᴄᴇss_ʀᴇsᴛᴏʀᴇᴅ\n`;
            restoreLog += `└────────────────────────┈\n\n`;
            restoreLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: restoreLog, 
                mentions: [target] 
            });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ᴜɴᴀʙʟᴇ ᴛᴏ ᴇxᴇᴄᴜᴛᴇ ᴜɴʙʟᴏᴄᴋ.\n└────────────────────────┈` 
            });
        }
    }
};

export default unblockCommand;
