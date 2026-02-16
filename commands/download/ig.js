const axios = require('axios');

module.exports = {
    name: "ig",
    category: "downloader",
    desc: "Download Instagram Reels and Videos",
    async execute(sock, msg, args, { prefix, from }) {
        const url = args[0];
        if (!url || !url.includes("instagram.com")) {
            return sock.sendMessage(from, { text: `| ❌ Usage: ${prefix}ig [link]` });
        }

        const { key } = await sock.sendMessage(from, { 
            text: `+--- [#] IG_ENGINE [#] ---+\n|\n|  STATUS: [ EXTRACTING... ]\n|  TYPE: REELS/POST\n|\n+--- [*] V_DIGITAL_HUB [*] ---+` 
        });

        try {
            // Using a high-speed IG Scraper API
            const res = await axios.get(`https://api.vreden.my.id/api/igdl?url=${url}`);
            const result = res.data.result[0]; // IG often returns an array of media

            if (!result || !result.url) throw new Error("No Media Found");

            await sock.sendMessage(from, { 
                text: `+--- [#] IG_ENGINE [#] ---+\n|\n|  STATUS: [ SENDING... ]\n|  FILE: MP4_VIDEO\n|\n+--- [*] V_DIGITAL_HUB [*] ---+`, 
                edit: key 
            });

            let caption = `+--- [#] INSTAGRAM_DL [#] ---+\n`;
            caption += `|\n`;
            caption += `|  SOURCE: Instagram\n`;
            caption += `|  QUALITY: High Definition\n`;
            caption += `|\n`;
            caption += `+--- [*] V_DIGITAL_HUB [*] ---+`;

            await sock.sendMessage(from, { 
                video: { url: result.url }, 
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { 
                text: `+--- [#] ERROR_LOG [#] ---+\n|\n|  STATUS: FAILED\n|  REASON: PRIVATE_OR_INVALID\n|\n+--- [*] V_DIGITAL_HUB [*] ---+`, 
                edit: key 
            });
        }
    }
};