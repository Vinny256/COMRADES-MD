const axios = require('axios');

module.exports = {
    name: "tt",
    category: "downloader",
    desc: "Download TikTok videos without watermark",
    async execute(sock, msg, args, { prefix, from }) {
        const url = args[0];
        if (!url || !url.includes("tiktok.com")) {
            return sock.sendMessage(from, { text: `| ❌ Provide a TikTok link!\n| Example: ${prefix}tt https://vt.tiktok.com/xxx` });
        }

        await sock.sendMessage(from, { text: "| ⏳ Processing TikTok Video..." });

        try {
            // Using the Tikwm API (Free and stable)
            const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
            const data = response.data.data;

            if (!data) return sock.sendMessage(from, { text: "│ ❌ Video not found or link is private." });

            const videoUrl = data.play; // No-watermark HD link
            const title = data.title || "Vinnie Hub Download";

            let res = `+--- [#] TIKTOK_DL [#] ---+\n`;
            res += `|\n`;
            res += `|  DESC: ${title.slice(0, 30)}...\n`;
            res += `|  USER: ${data.author.nickname}\n`;
            res += `|  TYPE: HD No-Watermark\n`;
            res += `|\n`;
            res += `+--- [*] V_DIGITAL_HUB [*] ---+`;

            // Send the video
            await sock.sendMessage(from, { 
                video: { url: videoUrl }, 
                caption: res 
            });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: "│ ❌ Failed to download. API might be busy." });
        }
    }
};