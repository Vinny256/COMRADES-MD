const axios = require('axios');

module.exports = {
    name: "tt",
    category: "downloader",
    desc: "No-watermark TikTok downloader",
    async execute(sock, msg, args, { prefix, from }) {
        const url = args[0];
        if (!url || !url.includes("tiktok.com")) {
            return sock.sendMessage(from, { text: "┃ ❌ Error: Provide TikTok Link" });
        }

        // Phase 1: Requesting State
        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ V_HUB_DL ✿ ━━━━━┓\n┃\n┃  TYPE: TIKTOK_VIDEO\n┃  STAT: [ FETCHING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
        });

        try {
            const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            const data = response.data.data;

            if (!data) throw new Error("Private_Link");

            const videoUrl = data.play;
            const title = data.title || "No Title";

            // Phase 2: Building Premium Caption
            let caption = `┏━━━━━ ✿ TT_RESULT ✿ ━━━━━┓\n`;
            caption += `┃\n`;
            caption += `┃  USER: ${data.author.nickname.slice(0, 12)}\n`;
            caption += `┃  DESC: ${title.slice(0, 15)}...\n`;
            caption += `┃  QUAL: HD_NO_WM\n`;
            caption += `┃\n`;
            caption += `┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`;

            // Phase 3: Send Video & Delete Loading Message
            await sock.sendMessage(from, { 
                video: { url: videoUrl }, 
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ ERROR_LOG ✿ ━━━━━┓\n┃\n┃  STAT: FAILED\n┃  ERR: PRIVATE/OFFLINE\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`, 
                edit: key 
            });
        }
    }
};