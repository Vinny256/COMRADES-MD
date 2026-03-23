const adminsCommand = {
    name: "admins",
    category: "group",
    desc: "Tag all administrators",
    async execute(sock, msg, args, { from }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!from.endsWith('@g.us')) return;

        // --- 📊 FETCH METADATA ---
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants
            .filter(p => p.admin || p.isSuperAdmin)
            .map(p => p.id);

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "👮", key: msg.key } });

        // --- 📑 STAFF UI CONSTRUCTION ---
        let adminList = `┌────────────────────────┈\n`;
        adminList += `│      *ɢʀᴏᴜᴘ_sᴛᴀғғ_ʟᴏɢ* \n`;
        adminList += `└────────────────────────┈\n\n`;
        
        adminList += `┌─『 ᴀᴅᴍɪɴ_ʟɪsᴛ 』\n`;
        for (let admin of admins) {
            adminList += `│ 🛡️ @${admin.split('@')[0]}\n`;
        }
        adminList += `└────────────────────────┈\n\n`;
        
        adminList += `┌─『 sᴜᴍᴍᴀʀʏ 』\n`;
        adminList += `│ ⚙ *ᴛᴏᴛᴀʟ:* ${admins.length}\n`;
        adminList += `│ ⚙ *sᴛᴀᴛᴜs:* ᴏɴʟɪɴᴇ ᴠɪᴀ ᴠ-ʜᴜʙ\n`;
        adminList += `└────────────────────────┈\n\n`;
        
        adminList += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        // --- 🚀 DISPATCH WITH MENTIONS ---
        await sock.sendMessage(from, { 
            text: adminList, 
            mentions: admins 
        }, { quoted: msg });
    }
};

export default adminsCommand;
