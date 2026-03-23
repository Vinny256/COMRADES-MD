import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

const playCommand = {
    name: "play",
    category: "downloader",
    desc: "Premium YouTube Downloader",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        
        // 1. Validation Logic
        if (!query) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* ${prefix}ᴘʟᴀʏ [ɴᴀᴍᴇ]\n└────────────────────────┈` 
            });
        }

        // Phase 1: Requesting State (Sleek UI)
        const { key } = await sock.sendMessage(from, { 
            text: `┌────────────────────────┈\n` +
                  `│      *ʏᴛ_ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* \n` +
                  `└────────────────────────┈\n\n` +
                  `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n` +
                  `│ ⚙ *ǫᴜᴇʀʏ:* ${query.slice(0, 15)}...\n` +
                  `│ ⚙ *sᴛᴀᴛ:* [ ʀᴇǫᴜᴇsᴛɪɴɢ... ]\n` +
                  `└────────────────────────┈`
        });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) throw new Error("Not_Found");

            // Phase 2: Extracting (Sleek UI Edit)
            await sock.sendMessage(from, { 
                text: `┌────────────────────────┈\n` +
                      `│      *ʏᴛ_ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* \n` +
                      `└────────────────────────┈\n\n` +
                      `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n` +
                      `│ ⚙ *ᴛɪᴛʟᴇ:* ${video.title.slice(0, 15)}...\n` +
                      `│ ⚙ *sᴛᴀᴛ:* [ ᴇxᴛʀᴀᴄᴛɪɴɢ... ]\n` +
                      `└────────────────────────┈`, 
                edit: key 
            });

            const videoUrl = video.url;
            const info = await ytdl.getInfo(videoUrl);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'mp4' });

            let caption = `┌────────────────────────┈\n`;
            caption += `│      *ʏᴛ_ʀᴇsᴜʟᴛ* \n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `┌─『 ᴍᴇᴅɪᴀ_ᴅᴇᴛᴀɪʟs 』\n`;
            caption += `│ ⚙ *ᴛɪᴛʟᴇ:* ${video.title.slice(0, 25)}\n`;
            caption += `│ ⚙ *ᴅᴜʀᴀᴛɪᴏɴ:* ${video.timestamp}\n`;
            caption += `│ ⚙ *ǫᴜᴀʟɪᴛʏ:* ʜᴅ_ᴀᴜᴛᴏ\n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // Phase 3: Final Delivery
            await sock.sendMessage(from, { 
                video: { url: format.url }, 
                caption: caption 
            }, { quoted: msg });

            // Cleanup the "Rendering" message
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error(`❌ [COMMAND_ERR] YouTube download failed: ${e.message}`);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *sᴛᴀᴛ:* ғᴀɪʟᴇᴅ\n│ ⚙ *ᴇʀʀ:* ʀᴇɢɪᴏɴ_ʙʟᴏᴄᴋ\n│ ⚙ *ᴛɪᴘ:* ᴄʜᴇᴄᴋ sᴇʀᴠᴇʀ ɪᴘ\n└────────────────────────┈`, 
                edit: key 
            });
        }
    }
};

export default playCommand;
