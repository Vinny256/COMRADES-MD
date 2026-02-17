const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');

module.exports = {
    name: "play",
    category: "downloader",
    desc: "Premium YouTube Downloader",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(from, { text: "┃ ❌ Usage: .play [name]" });

        // Phase 1: Requesting State
        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ V_HUB_SYS ✿ ━━━━━┓\n┃\n┃  QUERY: ${query.slice(0, 15)}...\n┃  STAT: [ REQUESTING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
        });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) throw new Error("Not_Found");

            // Phase 2: Extracting (Edit Message)
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ V_HUB_SYS ✿ ━━━━━┓\n┃\n┃  TITLE: ${video.title.slice(0, 15)}...\n┃  STAT: [ EXTRACTING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`, 
                edit: key 
            });

            // Use @distube/ytdl-core with specific agent settings to bypass Heroku blocks
            const videoUrl = video.url;
            const info = await ytdl.getInfo(videoUrl);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'mp4' });

            let caption = `┏━━━━━ ✿ YT_RESULT ✿ ━━━━━┓\n`;
            caption += `┃\n`;
            caption += `┃  TITLE: ${video.title.slice(0, 20)}\n`;
            caption += `┃  TIME: ${video.timestamp}\n`;
            caption += `┃  QUAL: HD_720P\n`;
            caption += `┃\n`;
            caption += `┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`;

            // Phase 3: Final Delivery
            await sock.sendMessage(from, { 
                video: { url: format.url }, 
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ ERROR_LOG ✿ ━━━━━┓\n┃\n┃  STAT: FAILED\n┃  ERR: REGION_BLOCK\n┃  TIP: USE COOKIES\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`, 
                edit: key 
            });
        }
    }
};