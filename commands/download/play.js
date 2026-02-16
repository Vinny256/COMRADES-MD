const yts = require('yt-search');
const axios = require('axios');

module.exports = {
    name: "play",
    category: "downloader",
    desc: "Search and download YouTube videos with solid ASCII styling",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(from, { text: `| ❌ Usage: ${prefix}play [video name]` });

        // Phase 1: Solid ASCII Search Frame
        const { key } = await sock.sendMessage(from, { 
            text: `+--- [#] YT_SEARCH [#] ---+\n|\n|  QUERY: ${query}\n|  STATUS: [ SEARCHING... ]\n|\n+--- [*] V_DIGITAL_HUB [*] ---+` 
        });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: "| ❌ No results found.", edit: key });

            // Phase 2: Update with solid lines
            await sock.sendMessage(from, { 
                text: `+--- [#] YT_ENGINE [#] ---+\n|\n|  FOUND: ${video.title.slice(0, 25)}...\n|  STATUS: [ DOWNLOADING... ]\n|\n+--- [*] V_DIGITAL_HUB [*] ---+`, 
                edit: key 
            });

            // Using the stable Vreden API
            const res = await axios.get(`https://api.vreden.my.id/api/ytmp4?url=${video.url}`);
            const downloadUrl = res.data.result.download.url;

            // Phase 3: Final Frame for Caption
            let caption = `+--- [#] YOUTUBE_PLAY [#] ---+\n`;
            caption += `|\n`;
            caption += `|  TITLE: ${video.title}\n`;
            caption += `|  TIME: ${video.timestamp}\n`;
            caption += `|  VIEWS: ${video.views}\n`;
            caption += `|  CHANNEL: ${video.author.name}\n`;
            caption += `|\n`;
            caption += `+--- [*] V_DIGITAL_HUB [*] ---+`;

            await sock.sendMessage(from, { 
                video: { url: downloadUrl }, 
                caption: caption 
            }, { quoted: msg });

            // Delete the status message to keep the chat clean
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { 
                text: `+--- [#] ERROR_LOG [#] ---+\n|\n|  STATUS: FAILED\n|  REASON: API_OFFLINE\n|\n+--- [*] V_DIGITAL_HUB [*] ---+`, 
                edit: key 
            });
        }
    }
};