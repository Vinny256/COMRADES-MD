const yts = require('yt-search');
const axios = require('axios');

module.exports = {
    name: "play",
    category: "downloader",
    desc: "Search and download YouTube videos by name",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(from, { text: `| ❌ Usage: ${prefix}play [video name]` });

        // Phase 1: Searching
        const { key } = await sock.sendMessage(from, { text: "+--- [#] YT_SEARCH [#] ---+\n|\n|  QUERY: " + query + "\n|  STATUS: [ SEARCHING... ]\n|\n+--------------------------+" });

        try {
            // Find the video
            const search = await yts(query);
            const video = search.videos[0]; // Get the first result

            if (!video) return sock.sendMessage(from, { text: "| ❌ No results found.", edit: key });

            // Phase 2: Update to Downloading
            await sock.sendMessage(from, { 
                text: `+--- [#] YT_ENGINE [#] ---+\n|\n|  FOUND: ${video.title.slice(0, 20)}...\n|  STATUS: [ DOWNLOADING... ]\n|\n+--------------------------+`, 
                edit: key 
            });

            // Fetch the download link
            const response = await axios.get(`https://api.giftedtech.my.id/api/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=gifted`);
            const data = response.data.result;

            // Phase 3: Final Update
            await sock.sendMessage(from, { 
                text: `+--- [#] YT_ENGINE [#] ---+\n|\n|  STATUS: [ SENDING_FILE ]\n|  SIZE: ${video.timestamp}\n|\n+--------------------------+`, 
                edit: key 
            });

            let caption = `+--- [#] YOUTUBE_PLAY [#] ---+\n`;
            caption += `|\n`;
            caption += `|  TITLE: ${video.title}\n`;
            caption += `|  VIEWS: ${video.views}\n`;
            caption += `|  DURATION: ${video.timestamp}\n`;
            caption += `|\n`;
            caption += `+--- [*] V_DIGITAL_HUB [*] ---+`;

            await sock.sendMessage(from, { 
                video: { url: data.download_url }, 
                caption: caption 
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: "| ❌ Error: Search failed or file too large.", edit: key });
        }
    }
};