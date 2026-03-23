import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';

const ytCommand = {
    name: "yt",
    category: "downloader",
    desc: "Download YouTube Videos",
    async execute(sock, msg, args, { prefix, from }) {
        const url = args[0];

        // 1. Validation Logic
        if (!url || !url.includes("youtube.com") && !url.includes("youtu.be")) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* ${prefix}ʏᴛ [ʟɪɴᴋ]\n└────────────────────────┈` 
            });
        }

        // Phase 1: Requesting State (Sleek UI)
        const { key } = await sock.sendMessage(from, { 
            text: `┌────────────────────────┈\n` +
                  `│      *ʏᴛ_ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* \n` +
                  `└────────────────────────┈\n\n` +
                  `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n` +
                  `│ ⚙ *ᴛʏᴘᴇ:* ʏᴏᴜᴛᴜʙᴇ_ᴠɪᴅᴇᴏ\n` +
                  `│ ⚙ *sᴛᴀᴛ:* [ ғᴇᴛᴄʜɪɴɢ... ]\n` +
                  `└────────────────────────┈`
        });

        try {
            // Phase 2: Extraction
            const info = await ytdl.getInfo(url);
            const title = info.videoDetails.title;
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'mp4' });

            await sock.sendMessage(from, { 
                text: `┌─『 ᴇxᴛʀᴀᴄᴛɪᴏɴ_ʟᴏɢ 』\n│ ⚙ *ᴛɪᴛʟᴇ:* ${title.slice(0, 20)}...\n│ ⚙ *sᴛᴀᴛ:* [ sᴇɴᴅɪɴɢ... ]\n└────────────────────────┈`, 
                edit: key 
            });

            // Phase 3: Premium Caption Building
            let caption = `┌────────────────────────┈\n`;
            caption += `│      *ʏᴛ_ʀᴇsᴜʟᴛ* \n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `┌─『 ᴍᴇᴅɪᴀ_ᴅᴇᴛᴀɪʟs 』\n`;
            caption += `│ ⚙ *ᴛɪᴛʟᴇ:* ${title.slice(0, 30)}\n`;
            caption += `│ ⚙ *ǫᴜᴀʟɪᴛʏ:* 𝟽𝟸𝟶ᴘ_ᴀᴜᴛᴏ\n`;
            caption += `│ ⚙ *sʏsᴛᴇᴍ:* ᴠɪɴɴɪᴇ_ʜᴜʙ_ᴠ𝟽\n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // Phase 4: Final Delivery & Cleanup
            await sock.sendMessage(from, { 
                video: { url: format.url }, 
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error(`❌ [YT_ERR]: ${e.message}`);
            await sock.sendMessage(from, { 
                text: `┌─『 sᴄʀᴀᴘᴇ_ᴇʀʀ 』\n│ ⚙ *sᴛᴀᴛ:* ғᴀɪʟᴇᴅ\n│ ⚙ *ᴇʀʀ:* ʀᴇɢɪᴏɴ_ʙʟᴏᴄᴋᴇᴅ\n└────────────────────────┈`, 
                edit: key 
            });
        }
    }
};

export default ytCommand;
