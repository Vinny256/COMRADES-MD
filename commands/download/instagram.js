// Ensure your igScraper is also updated to ESM or use dynamic import
import { igDownload } from '../../lib/igScraper.js'; 

const igCommand = {
    name: "ig",
    category: "downloader",
    desc: "Download Instagram Media",
    async execute(sock, msg, args, { from }) {
        const url = args[0];
        const senderName = msg.pushName || "ᴄᴏᴍʀᴀᴅᴇ";

        // 1. Validation Logic
        if (!url || !url.includes('instagram.com')) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ɪɢ ʟɪɴᴋ.\n└────────────────────────┈` 
            });
        }

        console.log(`📥 [DOWNLOAD] IG request from ${senderName} in ${from}`);

        // 2. Rendering State (Sleek UI)
        const { key } = await sock.sendMessage(from, { 
            text: `┌────────────────────────┈\n` +
                  `│      *ɪɢ_ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* \n` +
                  `└────────────────────────┈\n\n` +
                  `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n` +
                  `│ ⚙ *ᴛʏᴘᴇ:* ɪɢ_sᴄʀᴀᴘᴇʀ\n` +
                  `│ ⚙ *sᴛᴀᴛ:* [ ʀᴇɴᴅᴇʀɪɴɢ... ]\n` +
                  `└────────────────────────┈`
        });

        try {
            const result = await igDownload(url);

            // 3. Media Type Detection
            const isVideo = result.mediaUrl.includes('.mp4') || url.includes('/reels/');

            // 4. Dispatch Media
            if (isVideo) {
                console.log(`🎞️ [SENDING] Video file to ${from}`);
                await sock.sendMessage(from, { 
                    video: { url: result.mediaUrl }, 
                    caption: `┌─『 ᴅᴏᴡɴʟᴏᴀᴅ_ᴄᴏᴍᴘʟᴇᴛᴇ 』\n│ ⚙ *sᴏᴜʀᴄᴇ:* ɪɴsᴛᴀɢʀᴀᴍ\n│ ⚙ *ᴠɪʙᴇ:* ᴠɪɴɴɪᴇ_ʜᴜʙ\n└────────────────────────┈`,
                    gifPlayback: false 
                }, { quoted: msg });
            } else {
                console.log(`🖼️ [SENDING] Image file to ${from}`);
                await sock.sendMessage(from, { 
                    image: { url: result.mediaUrl }, 
                    caption: `┌─『 ᴅᴏᴡɴʟᴏᴀᴅ_ᴄᴏᴍᴘʟᴇᴛᴇ 』\n│ ⚙ *sᴏᴜʀᴄᴇ:* ɪɴsᴛᴀɢʀᴀᴍ\n│ ⚙ *ᴠɪʙᴇ:* ᴠɪɴɴɪᴇ_ʜᴜʙ\n└────────────────────────┈` 
                }, { quoted: msg });
            }

            // Cleanup the "Rendering" message
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error(`❌ [COMMAND_ERR] Instagram download failed: ${e.message}`);
            await sock.sendMessage(from, { 
                text: `┌─『 sᴄʀᴀᴘᴇ_ᴇʀʀ 』\n│ ⚙ *sᴛᴀᴛ:* ғᴀɪʟᴇᴅ\n│ ⚙ *ᴇʀʀ:* ᴘʀɪᴠᴀᴛᴇ_ᴏʀ_ʙʟᴏᴄᴋᴇᴅ\n└────────────────────────┈`, 
                edit: key 
            });
        }
    }
};

export default igCommand;
