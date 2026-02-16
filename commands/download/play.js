const yts = require('yt-search');
const axios = require('axios');

module.exports = {
    name: "play",
    category: "downloader",
    desc: "Robust YouTube search and download",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(from, { text: `| ❌ Usage: ${prefix}play [video name]` });

        const { key } = await sock.sendMessage(from, { 
            text: `+--- [#] YT_SEARCH [#] ---+\n|\n|  QUERY: ${query}\n|  STATUS: [ SEARCHING... ]\n|\n+--- [*] V_DIGITAL_HUB [*] ---+` 
        });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: "| ❌ No results found.", edit: key });

            await sock.sendMessage(from, { 
                text: `+--- [#] YT_ENGINE [#] ---+\n|\n|  FOUND: ${video.title.slice(0, 25)}...\n|  STATUS: [ DOWNLOADING... ]\n|\n+--- [*] V_DIGITAL_HUB [*] ---+`, 
                edit: key 
            });

            let downloadUrl = null;

            // --- Robust Fallback Logic ---
            try {
                // Try API 1 (Vreden Updated Endpoint)
                const res1 = await axios.get(`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(video.url)}`);
                downloadUrl = res1.data.result.download.url;
            } catch (e) {
                // Try API 2 (Backup: Guru API)
                const res2 = await axios.get(`https://api.botcahx.eu.org/api/dowloader/ytmp4?url=${encodeURIComponent(video.url)}&apikey=vinnie`);
                downloadUrl = res2.data.result.url;
            }

            if (!downloadUrl) throw new Error("All APIs Offline");

            let caption = `+--- [#] YOUTUBE_PLAY [#] ---+\n`;
            caption += `|\n`;
            caption += `|  TITLE: ${video.title}\n`;
            caption += `|  TIME: ${video.timestamp}\n`;
            caption += `|  VIEWS: ${video.views}\n`;
            caption += `|\n`;
            caption += `+--- [*] V_DIGITAL_HUB [*] ---+`;

            await sock.sendMessage(from, { 
                video: { url: downloadUrl }, 
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `+--- [#] ERROR_LOG [#] ---+\n|\n|  STATUS: FAILED\n|  REASON: ALL_APIS_OFFLINE\n|  TIP: Use a Direct Link\n|\n+--- [*] V_DIGITAL_HUB [*] ---+`, 
                edit: key 
            });
        }
    }
};