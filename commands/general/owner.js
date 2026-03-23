const ownerCommand = {
    name: "owner",
    category: "general",
    desc: "V_HUB: Meet the Founder",
    async execute(sock, msg, args, { from }) {
        // --- 💎 FOUNDER IDENTITY ---
        const ownerName = "ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ";
        const ownerLocation = "ᴋɪᴀᴍʙᴜ, ᴋᴇɴʏᴀ 🇰🇪";
        const institution = "ᴜɴɪᴠᴇʀsɪᴛʏ ᴏғ ᴇᴍʙᴜ (ᴜᴏᴇ)";
        const contact = "254768666068";

        // Best React Emoji for Identity
        await sock.sendMessage(from, { react: { text: "👑", key: msg.key } });

        // --- ✦ VCARD GENERATOR ✦ ---
        const vcard = 'BEGIN:VCARD\n'
            + 'VERSION:3.0\n' 
            + `FN:${ownerName}\n` 
            + `ORG:Vinnie Digital Hub;\n` 
            + `TEL;type=CELL;type=VOICE;waid=${contact}:${contact}\n` 
            + 'END:VCARD';

        // --- ⚡ UNICODE SLEEK STYLING ---
        const bio = `┌────────────────────────┈\n` +
                    `│      *${ownerName}* \n` +
                    `└────────────────────────┈\n\n` +
                    `┌─『 ғᴏᴜɴᴅᴇʀ ɪᴅᴇɴᴛɪᴛʏ 』\n` +
                    `│ ⚙ *ɴᴀᴍᴇ:* ${ownerName}\n` +
                    `│ ⚙ *ᴏʀɪɢɪɴ:* ${ownerLocation}\n` +
                    `│ ⚙ *sᴛᴜᴅɪᴇs:* ${institution}\n` +
                    `│ ⚙ *sᴛᴀᴛᴜs:* ғᴜʟʟ-sᴛᴀᴄᴋ ᴅᴇᴠ\n` +
                    `└────────────────────────┈\n\n` +
                    `┌─『 ᴀʙᴏᴜᴛ 』\n` +
                    `│ ◈ _ᴅᴇᴠᴇʟᴏᴘɪɴɢ ᴅɪɢɪᴛᴀʟ sᴏʟᴜᴛɪᴏɴs_\n` +
                    `│ ◈ _ғʀᴏᴍ ᴛʜᴇ ʜᴇᴀʀᴛ ᴏғ ᴇᴍʙᴜ._\n` +
                    `└────────────────────────┈\n\n` +
                    `◈ *ᴄᴏɴᴛᴀᴄᴛ:* wa.me/${contact}`;

        // 1. Sending the Bio message
        await sock.sendMessage(from, { 
            text: bio, 
            mentions: [contact + '@s.whatsapp.net'] 
        }, { quoted: msg });

        // 2. Sending the Clickable V-Card
        await sock.sendMessage(from, { 
            contacts: { 
                displayName: ownerName, 
                contacts: [{ vcard }] 
            } 
        }, { quoted: msg });
    }
};

export default ownerCommand;
