import yts from 'yt-search';
import axios from 'axios';

const playCommand = {
    name: "play",
    category: "downloader",
    desc: "Premium YouTube Downloader",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        
        // 1. Validation Logic
        if (!query) {
            return sock.sendMessage(from, { 
                text: `┌─『 SYSTEM_ERR 』\n│ USAGE: ${prefix}play [name]\n└────────────────────────┈` 
            });
        }

        // Phase 1: Requesting State (Sleek UI)
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

            // Phase 2: Fetching (Sleek UI Edit)
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

            // 🚀 Updated to use noobs-api logic
            const apiUrl = `https://noobs-api.top/dipto/ytDl3?link=${encodeURIComponent(video.url)}&format=mp3`;
            const response = await axios.get(apiUrl);
            const downloadUrl = response.data.download_url || response.data.result || response.data.link;

            if (!downloadUrl) throw new Error("API_ERROR");

            let caption = `┌────────────────────────┈\n`;
            caption += `│      *YT_RESULT* \n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `┌─『 MEDIA_DETAILS 』\n`;
            caption += `│ TITLE: ${video.title.slice(0, 25)}\n`;
            caption += `│ DURATION: ${video.timestamp}\n`;
            caption += `│ QUALITY: 320KBPS_AUDIO\n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `_INFINITE IMPACT x VINNIE DIGITAL_`;

            // Phase 3: Final Delivery (Sending as Audio/Voice)
            await sock.sendMessage(from, { 
                audio: { url: downloadUrl }, 
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                caption: caption 
            }, { quoted: msg });

            // Cleanup the status message
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error(`❌ [PLAY_ERR] API failure: ${e.message}`);
            await sock.sendMessage(from, { 
                text: `┌─『 SYSTEM_ERR 』\n│ STAT: FAILED\n│ ERR: API_TIMEOUT\n│ TIP: TRY AGAIN LATER\n└────────────────────────┈`, 
                edit: key 
            });
        }
    }
};

export default playCommand;
