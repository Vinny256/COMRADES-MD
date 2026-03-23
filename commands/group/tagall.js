const tagallCommand = {
    name: "tagall",
    category: "group",
    desc: "Tag everyone in the group",
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
        await sock.sendMessage(from, { react: { text: "📣", key: msg.key } });

        // --- 📑 BROADCAST UI CONSTRUCTION ---
        const message = args.join(" ") || "ɴᴏ_ᴍᴇssᴀɢᴇ_ᴘʀᴏᴠɪᴅᴇᴅ";
        
        let txt = `┌────────────────────────┈\n`;
        txt += `│      *ɢʀᴏᴜᴘ_ʙʀᴏᴀᴅᴄᴀsᴛ* \n`;
        txt += `└────────────────────────┈\n\n`;
        txt += `┌─『 ᴀɴɴᴏᴜɴᴄᴇᴍᴇɴᴛ 』\n`;
        txt += `│ 📢 *ᴍsɢ:* ${message}\n`;
        txt += `└────────────────────────┈\n\n`;
        
        txt += `┌─『 ᴍᴇᴍʙᴇʀ_ʟɪsᴛ 』\n`;
        for (let mem of participants) {
            txt += `│ 🔹 @${mem.id.split('@')[0]}\n`;
        }
        txt += `└────────────────────────┈\n\n`;
        
        txt += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        // --- 🚀 DISPATCH WITH MENTIONS ---
        await sock.sendMessage(from, { 
            text: txt, 
            mentions: participants.map(p => p.id) 
        }, { quoted: msg });
    }
};

export default tagallCommand;
