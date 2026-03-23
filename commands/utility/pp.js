const profilePictureCommand = {
    name: "pp",
    category: "utility",
    desc: "Extract HD Profile Picture of a user",
    async execute(sock, msg, args, { from, prefix }) {
        // --- 🎯 TARGET IDENTIFICATION ---
        // Priorities: 1. Tagged User, 2. Quoted Message, 3. Manual Number, 4. Sender
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const tagged = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        let target = tagged || quoted || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : msg.key.participant || from);

        // --- ✦ INITIAL REACTION & SCANNING ---
        const { key } = await sock.sendMessage(from, { 
            text: `┌─『 ᴠ_ʜᴜʙ_sʏsᴛᴇᴍ 』\n│ 🔍 *ɪɴᴅᴇxɪɴɢ:* ᴘᴘ_ᴇxᴛʀᴀᴄᴛᴏʀ\n│ ⚙ *sᴛᴀᴛ:* [ sᴄᴀɴɴɪɴɢ... ]\n└────────────────────────┈` 
        });

        try {
            // --- 🚀 FETCH HD URL ---
            const ppUrl = await sock.profilePictureUrl(target, 'image');

            // --- 📑 RESULT UI CONSTRUCTION ---
            let ppLog = `┌────────────────────────┈\n`;
            ppLog += `│      *ᴠ-ʜᴜʙ_ᴘᴘ_ʀᴇsᴜʟᴛ* \n`;
            ppLog += `└────────────────────────┈\n\n`;
            
            ppLog += `┌─『 ᴇxᴛʀᴀᴄᴛɪᴏɴ_ᴅᴀᴛᴀ 』\n`;
            ppLog += `│ 👤 *ᴜsᴇʀ:* @${target.split('@')[0]}\n`;
            ppLog += `│ ✅ *ǫᴜᴀʟ:* ʜᴅ_ᴏʀɪɢɪɴᴀʟ\n`;
            ppLog += `│ ⚙ *ʟᴏɢ:* sᴜᴄᴄᴇssғᴜʟ_ᴅᴇʟɪᴠᴇʀʏ\n`;
            ppLog += `└────────────────────────┈\n\n`;
            
            ppLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // --- 📦 DELIVERY ---
            await sock.sendMessage(from, { 
                image: { url: ppUrl }, 
                caption: ppLog,
                mentions: [target]
            }, { quoted: msg });

            // Clean up the scanning message
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            // --- 🛡️ PRIVACY / ERROR HANDLING ---
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ғᴀɪʟᴜʀᴇ 』\n│ ❌ *sᴛᴀᴛ:* ғᴀɪʟᴇᴅ\n│ ⚙ *ᴇʀʀ:* ᴘʀɪᴠᴀᴄʏ_ʀᴇsᴛʀɪᴄᴛ\n│ 💡 *ᴍsɢ:* ɴᴏ_ᴘᴜʙʟɪᴄ_ɪᴍᴀɢᴇ_ғᴏᴜɴᴅ\n└────────────────────────┈`, 
                edit: key 
            });
        }
    }
};

export default profilePictureCommand;
