const songCommand = {
    name: "song",
    category: "download",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        
        // 1. Validation Logic
        if (!query) {
            return await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* ${prefix}sᴏɴɢ [ɴᴀᴍᴇ]\n│ ⚙ *ᴇx:* ${prefix}sᴏɴɢ ʟɪғᴇsᴛʏʟᴇ\n└────────────────────────┈` 
            });
        }

        try {
            // 2. Initial Feedback
            await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });
            await sock.sendPresenceUpdate('composing', from);

            // 3. Fetch from API (ESM Native Fetch)
            const searchApi = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(query)}`;
            const response = await fetch(searchApi);
            const data = await response.json();

            if (!data.status || !data.result) {
                throw new Error("Song not found or API down");
            }

            const { title, download } = data.result;

            // 4. Elite Info Dashboard
            let infoMsg = `┌────────────────────────┈\n`;
            infoMsg += `│      *ᴠ_ʜᴜʙ_ᴍᴜsɪᴄ* \n`;
            infoMsg += `└────────────────────────┈\n\n`;
            infoMsg += `┌─『 sᴏɴɢ_ғᴏᴜɴᴅ 』\n`;
            infoMsg += `│ 🎵 *ᴛɪᴛʟᴇ:* ${title}\n`;
            infoMsg += `│ 📥 *sᴛᴀᴛᴜs:* sᴇɴᴅɪɴɢ_ᴀᴜᴅɪᴏ\n`;
            infoMsg += `│ ⚙ *sʏsᴛᴇᴍ:* ᴠɪɴɴɪᴇ_ʜᴜʙ_ᴠ𝟽\n`;
            infoMsg += `└────────────────────────┈\n\n`;
            infoMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: infoMsg }, { quoted: msg });

            // 5. Final Delivery (MP3 File)
            await sock.sendMessage(from, { 
                audio: { url: download }, 
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: msg });

            // 6. Success Reaction
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

        } catch (e) {
            console.error(`❌ [MUSIC_ERR]: ${e.message}`);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ᴄᴏᴜʟᴅ ɴᴏᴛ ᴘʀᴏᴄᴇss sᴏɴɢ.\n│ ⚙ ᴛʀʏ ᴀ ᴅɪғғᴇʀᴇɴᴛ ǫᴜᴇʀʏ.\n└────────────────────────┈` 
            }, { quoted: msg });
        }
    }
};

export default songCommand;
