const { igDownload } = require('../../lib/igScraper');

module.exports = {
    name: "ig",
    category: "downloader",
    desc: "Download Instagram Reels/Photos via Scraper",
    async execute(sock, msg, args, { from }) {
        const url = args[0];
        if (!url || !url.includes('instagram.com')) {
            return sock.sendMessage(from, { text: "┃ ❌ Error: Provide a valid Instagram link" });
        }

        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ V_HUB_LAB ✿ ━━━━━┓\n┃\n┃  TYPE: IG_SCRAPER\n┃  STAT: [ FETCHING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
        });

        try {
            const result = await igDownload(url);

            if (result.isVideo) {
                await sock.sendMessage(from, { 
                    video: { url: result.mediaUrl }, 
                    caption: result.caption 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { 
                    image: { url: result.mediaUrl }, 
                    caption: result.caption 
                }, { quoted: msg });
            }

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ SCRAPE_ERR ✿ ━━━━━┓\n┃\n┃  STAT: FAILED\n┃  ERR: BLOCK_DETECTED\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`, 
                edit: key 
            });
        }
    }
};