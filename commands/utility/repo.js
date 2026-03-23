const repoCommand = {
    name: 'repo',
    category: 'utility',
    desc: 'Consolidated Repo & Owner info.',
    async execute(sock, msg, args, { from, prefix }) {
        const repoUri = "https://github.com/Vinny256/COMRADES-MD"; 
        const ownerNumber = "254768666068";
        
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "📦", key: msg.key } });

        // --- 📑 REPO UI CONSTRUCTION ---
        let repoLog = `┌────────────────────────┈\n`;
        repoLog += `│      *ᴠ-ʜᴜʙ_ᴄᴏʀᴇ_ʀᴇᴘᴏ* \n`;
        repoLog += `└────────────────────────┈\n\n`;
        
        repoLog += `┌─『 sʏsᴛᴇᴍ_ɪɴғᴏʀᴍᴀᴛɪᴏɴ 』\n`;
        repoLog += `│ 🚀 *ᴘʀᴏᴊᴇᴄᴛ:* ᴄᴏᴍʀᴀᴅᴇs-ᴍᴅ\n`;
        repoLog += `│ 👤 *ᴏᴡɴᴇʀ:* ᴠɪɴɴɪᴇ\n`;
        repoLog += `│ 🔗 *ʀᴇᴘᴏ:* ${repoUri}\n`;
        repoLog += `│ 🟢 *sᴛᴀᴛᴜs:* ᴏɴʟɪɴᴇ_ʟɪᴠᴇ\n`;
        repoLog += `│ 🛡️ *sʜɪᴇʟᴅ:* ɴᴜᴄʟᴇᴀʀ_sɪʟᴇɴᴄᴇ\n`;
        repoLog += `└────────────────────────┈\n\n`;
        
        repoLog += `_ᴄʟɪᴄᴋ ᴛʜᴇ ʟɪɴᴋ ᴀʙᴏᴠᴇ ᴛᴏ ᴠɪᴇᴡ sᴏᴜʀᴄᴇ_`;

        // --- 🚀 DELIVERY WITH ENHANCED AD-REPLY ---
        await sock.sendMessage(from, {
            text: repoLog,
            contextInfo: {
                externalAdReply: {
                    title: "V_HUB / COMRADES-MD",
                    body: "ᴛᴀᴘ ᴛᴏ ᴠɪᴇᴡ ɢɪᴛʜᴜʙ ʀᴇᴘᴏsɪᴛᴏʀʏ",
                    mediaType: 1,
                    thumbnailUrl: "https://avatars.githubusercontent.com/u/144422204?v=4", 
                    sourceUrl: repoUri,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    }
};

export default repoCommand;
