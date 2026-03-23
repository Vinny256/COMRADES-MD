const addCommand = {
    name: "add",
    category: "group",
    desc: "Add a member to the group",
    async execute(sock, msg, args, { from, isMe }) {
        if (!from.endsWith('@g.us')) return;

        // --- 🛡️ PERMISSION CHECKS ---
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

        // --- 📝 INPUT VALIDATION ---
        const prefix = process.env.PREFIX || '.';
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴀᴅᴅ [ɴᴜᴍʙᴇʀ]\n│ ⚙ *ᴇx:* ${prefix}ᴀᴅᴅ 𝟸𝟻𝟺𝟽𝟼𝟾𝟼𝟼𝟼𝟶𝟼𝟾\n└────────────────────────┈` 
            });
        }

        // Clean number and format JID
        const target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        try {
            // --- 🚀 EXECUTION ---
            const response = await sock.groupParticipantsUpdate(from, [target], "add");
            
            // Handle privacy block (Baileys returns status codes for add failures)
            if (response[0]?.status >= 400) {
                throw new Error("ᴘʀɪᴠᴀᴄʏ_ʙʟᴏᴄᴋ");
            }

            let successMsg = `┌────────────────────────┈\n`;
            successMsg += `│      *ɢʀᴏᴜᴘ_ᴜᴘᴅᴀᴛᴇ* \n`;
            successMsg += `└────────────────────────┈\n\n`;
            successMsg += `┌─『 sᴜᴄᴄᴇss 』\n`;
            successMsg += `│ ✅ *ᴀᴅᴅᴇᴅ:* @${target.split('@')[0]}\n`;
            successMsg += `│ ⚙ *sᴛᴀᴛᴜs:* ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛ_ʟɪᴠᴇ\n`;
            successMsg += `└────────────────────────┈\n\n`;
            successMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: successMsg, 
                mentions: [target] 
            });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┌─『 ᴀᴅᴅ_ғᴀɪʟᴇᴅ 』\n│ ⚙ *ʀᴇᴀsᴏɴ:* ᴘʀɪᴠᴀᴄʏ sᴇᴛᴛɪɴɢs\n│ 💡 sᴇɴᴅ ᴛʜᴇᴍ ᴀɴ ɪɴᴠɪᴛᴇ ʟɪɴᴋ.\n└────────────────────────┈` 
            });
        }
    }
};

export default addCommand;
