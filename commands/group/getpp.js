const getppCommand = {
    name: "getpp",
    category: "group",
    desc: "Extracts profile pictures in high resolution",
    async execute(sock, msg, args, { from, prefix }) {
        // --- 🎯 TARGET DETECTION (Group, Tag, or Reply) ---
        let target = from;
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        } else if (args[0] && args[0].includes('@')) {
            target = args[0].replace(/[^0-9]/g, '') + (args[0].includes('g.us') ? '@g.us' : '@s.whatsapp.net');
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🖼️", key: msg.key } });

        try {
            // Fetch the high-res URL ('image' type for full quality)
            const ppUrl = await sock.profilePictureUrl(target, 'image');

            // --- 📑 PREMIUM CAPTION UI ---
            let caption = `┌────────────────────────┈\n`;
            caption += `│      *ᴠ-ʜᴜʙ_ᴇxᴛʀᴀᴄᴛᴏʀ* \n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `┌─『 ᴍᴇᴅɪᴀ_ᴅᴇᴛᴀɪʟs 』\n`;
            caption += `│ 📸 *ᴛᴀʀɢᴇᴛ:* ${target.split('@')[0]}\n`;
            caption += `│ 🛠️ *ǫᴜᴀʟɪᴛʏ:* ʜɪɢʜ_ᴅᴇғɪɴɪᴛɪᴏɴ\n`;
            caption += `│ 📂 *sᴛᴀᴛᴜs:* ʟɪᴠᴇ ✦\n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                image: { url: ppUrl }, 
                caption: caption 
            }, { quoted: msg });

        } catch (e) {
            // --- ⚠️ ERROR UI ---
            let errorMsg = `┌─『 sʏsᴛᴇᴍ_ɴᴏᴛɪᴄᴇ 』\n`;
            errorMsg += `│ ❌ *ᴇxᴛʀᴀᴄᴛɪᴏɴ_ғᴀɪʟᴇᴅ*\n`;
            errorMsg += `│ ⚙ *ʀᴇᴀsᴏɴ:* ɴᴏ ɪᴍᴀɢᴇ ᴏʀ ᴘʀɪᴠᴀᴄʏ\n`;
            errorMsg += `└────────────────────────┈`;
            
            await sock.sendMessage(from, { text: errorMsg });
        }
    }
};

export default getppCommand;
