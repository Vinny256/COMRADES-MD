const { igDownload } = require('../../lib/igScraper');

module.exports = {
    name: "ig",
    category: "downloader",
    desc: "Download Instagram Media",
    async execute(sock, msg, args, { from }) {
        const url = args[0];
        if (!url || !url.includes('instagram.com')) {
            return sock.sendMessage(from, { text: "┃ ❌ Error: Provide a valid Instagram link" });
        }

        const senderName = msg.pushName || "User";
        console.log(`📥 [DOWNLOAD] IG request from ${senderName} in chat ${from}`);

        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ V_HUB_LAB ✿ ━━━━━┓\n┃\n┃  TYPE: IG_SCRAPER\n┃  STAT: [ RENDERING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
        });

        try {
            const result = await igDownload(url);

            // Determine if it's a video or image based on URL (Standard IG CDN check)
            const isVideo = result.mediaUrl.includes('.mp4') || url.includes('/reels/');

            if (isVideo) {
                console.log(`🎞️ [SENDING] Video file to ${from}`);
                await sock.sendMessage(from, { 
                    video: { url: result.mediaUrl }, 
                    caption: "✅ *V_HUB_IG_DOWNLOADER*" 
                }, { quoted: msg });
            } else {
                console.log(`🖼️ [SENDING] Image file to ${from}`);
                await sock.sendMessage(from, { 
                    image: { url: result.mediaUrl }, 
                    caption: "✅ *V_HUB_IG_DOWNLOADER*" 
                }, { quoted: msg });
            }

            // Cleanup the "Rendering" message
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error(`❌ [COMMAND_ERR] Instagram download failed: ${e.message}`);
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ SCRAPE_ERR ✿ ━━━━━┓\n┃\n┃  STAT: FAILED\n┃  ERR: PRIVATE_OR_BLOCKED\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`, 
                edit: key 
            });
        }
    }
};