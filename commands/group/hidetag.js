const hidetagCommand = {
    name: "hidetag",
    category: "group",
    desc: "Mention everyone without showing the tag list",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!from.endsWith('@g.us')) return;

        // --- 📊 FETCH METADATA ---
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin).map(p => p.id);
        
        // --- 🛡️ PERMISSION CHECK ---
        const sender = msg.key.participant || from;
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴅᴍɪɴ ᴘʀɪᴠɪʟᴇɢᴇ ʀᴇǫᴜɪʀᴇᴅ.\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "👻", key: msg.key } });

        // --- 📑 BROADCAST UI CONSTRUCTION ---
        const announcement = args.join(" ") || "ᴀᴛᴛᴇɴᴛɪᴏɴ ᴇᴠᴇʀʏᴏɴᴇ!";
        
        let styledMsg = `┌────────────────────────┈\n`;
        styledMsg += `│      *ɢʀᴏᴜᴘ_ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ* \n`;
        styledMsg += `└────────────────────────┈\n\n`;
        styledMsg += `┌─『 ᴍᴇssᴀɢᴇ 』\n`;
        styledMsg += `│ 📢 ${announcement}\n`;
        styledMsg += `└────────────────────────┈\n\n`;
        styledMsg += `_✨ ʙʀᴏᴀᴅᴄᴀsᴛ ᴛᴏ ᴀʟʟ ᴍᴇᴍʙᴇʀs_`;

        // --- 🚀 DISPATCH WITH HIDDEN MENTIONS ---
        // Mentions are included in the metadata but not visible in the text
        await sock.sendMessage(from, { 
            text: styledMsg, 
            mentions: participants.map(p => p.id) 
        });
    }
};

export default hidetagCommand;
