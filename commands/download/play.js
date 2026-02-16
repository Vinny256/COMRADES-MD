const yts = require('yt-search');
const ytdl = require('ytdl-core');

module.exports = {
    name: "play",
    category: "downloader",
    desc: "Internal engine search and download",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(from, { text: `| ❌ Usage: ${prefix}play [name]` });

        const { key } = await sock.sendMessage(from, { 
            text: `+--- [#] HUB_INTERNAL [#] ---+\n|\n|  QUERY: ${query}\n|  STATUS: [ SEARCHING... ]\n|\n+--- [*] V_DIGITAL_HUB [*] ---+` 
        });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: "| ❌ Video not found.", edit: key });

            await sock.sendMessage(from, { 
                text: `+--- [#] HUB_INTERNAL [#] ---+\n|\n|  TITLE: ${video.title.slice(0, 20)}...\n|  STATUS: [ EXTRACTING... ]\n|\n+--- [*] V_DIGITAL_HUB [*] ---+`, 
                edit: key 
            });

            // The Workaround: Get direct streaming URL with high-quality filter
            const info = await ytdl.getInfo(video.url);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'mp4' });

            let caption = `+--- [#] YOUTUBE_INTERNAL [#] ---+\n`;
            caption += `|\n`;
            caption += `|  TITLE: ${video.title}\n`;
            caption += `|  TIME: ${video.timestamp}\n`;
            caption += `|  ENGINE: ytdl-core (Direct)\n`;
            caption += `|\n`;
            caption += `+--- [*] V_DIGITAL_HUB [*] ---+`;

            await sock.sendMessage(from, { 
                video: { url: format.url }, 
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { 
                text: `+--- [#] ERROR_LOG [#] ---+\n|\n|  STATUS: FAILED\n|  REASON: YT_REGION_BLOCK\n|  TIP: YouTube is blocking Heroku IPs.\n|\n+--- [*] V_DIGITAL_HUB [*] ---+`, 
                edit: key 
            });
        }
    }
};