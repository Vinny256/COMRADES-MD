import yts from 'yt-search';
import axios from 'axios';

const playCommand = {
    name: "play",
    category: "downloader",
    desc: "Premium YouTube Downloader",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        
        if (!query) {
            return sock.sendMessage(from, { 
                text: `┌─『 SYSTEM_ERR 』\n│ USAGE: ${prefix}play [name]\n└────────────────────────┈` 
            });
        }

        const { key } = await sock.sendMessage(from, { 
            text: `┌────────────────────────┈\n` +
                  `│      *YT_DOWNLOADER* \n` +
                  `└────────────────────────┈\n\n` +
                  `┌─『 STATUS_LOG 』\n` +
                  `│ QUERY: ${query.slice(0, 15)}...\n` +
                  `│ STAT: [ REQUESTING... ]\n` +
                  `└────────────────────────┈`
        });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) throw new Error("Not_Found");

            await sock.sendMessage(from, { 
                text: `┌────────────────────────┈\n` +
                      `│      *YT_DOWNLOADER* \n` +
                      `└────────────────────────┈\n\n` +
                      `┌─『 STATUS_LOG 』\n` +
                      `│ TITLE: ${video.title.slice(0, 15)}...\n` +
                      `│ STAT: [ FETCHING_API... ]\n` +
                      `└────────────────────────┈`, 
                edit: key 
            });

            // 🚀 API CALL WITH TIMEOUT & BETTER ERROR HANDLING
            const apiUrl = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(video.url)}&format=mp3`;
            
            const response = await axios.get(apiUrl, { timeout: 45000 }).catch(e => {
                if (e.response && e.response.status === 520) throw new Error("API_CRASH_520");
                throw e;
            });

            const downloadUrl = response.data.download_url || response.data.result || response.data.link;

            if (!downloadUrl) throw new Error("API_INVALID_RESPONSE");

            let caption = `┌────────────────────────┈\n`;
            caption += `│      *YT_RESULT* \n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `┌─『 MEDIA_DETAILS 』\n`;
            caption += `│ TITLE: ${video.title.slice(0, 25)}\n`;
            caption += `│ DURATION: ${video.timestamp}\n`;
            caption += `│ QUALITY: 320KBPS_AUDIO\n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `_INFINITE IMPACT x VINNIE DIGITAL_`;

            await sock.sendMessage(from, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            let errorMsg = "API_TIMEOUT";
            if (e.message === "API_CRASH_520") errorMsg = "SERVER_OVERLOAD (520)";
            if (e.message === "Not_Found") errorMsg = "VIDEO_NOT_FOUND";

            console.error(`❌ [PLAY_ERR] ${errorMsg}: ${e.message}`);
            
            await sock.sendMessage(from, { 
                text: `┌─『 SYSTEM_ERR 』\n│ STAT: FAILED\n│ ERR: ${errorMsg}\n│ TIP: TRY A DIFFERENT SONG\n└────────────────────────┈`, 
                edit: key 
            });
        }
    }
};

export default playCommand;
