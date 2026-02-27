const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: "citizen",
    category: "news",
    async execute(sock, msg, args, { from, prefix }) {
        await sock.sendMessage(from, { react: { text: "🔍", key: msg.key } });

        try {
            // 1. Fetching with a hard-coded mobile agent
            const { data } = await axios.get('https://www.citizen.digital/news', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                },
                timeout: 10000
            });
            
            const $ = cheerio.load(data);
            
            // 2. Ultra-Aggressive Selector (finding the very first link that looks like a news story)
            const story = $('a[href*="/news/"]').first();
            const title = story.find('h1, h2, h3, .headline').first().text().trim() || $("meta[property='og:title']").attr('content');
            let link = story.attr('href');
            
            if (!link) throw new Error("Could not find story link");
            link = link.startsWith('http') ? link : `https://www.citizen.digital${link}`;

            // 3. Image extraction logic
            const thumb = story.find('img').attr('src') || $("meta[property='og:image']").attr('content') || "https://i.imgur.com/XHUY4VI.jpeg";

            // 4. THE NEWS CARD (Styled exactly for your 2026 UI)
            await sock.sendMessage(from, {
                image: { url: thumb },
                caption: `*🗞️ CITIZEN LATEST*\n\n*${title}*\n\n_Source: Citizen Digital Kenya_`,
                footer: "© 2026 | VINNIE NEWS HUB",
                buttons: [
                    { buttonId: 'read_more', buttonText: { displayText: '📖 Read More' }, type: 1 },
                    { buttonId: 'share_news', buttonText: { displayText: '🔗 Get Link' }, type: 1 }
                ],
                headerType: 4,
                contextInfo: {
                    externalAdReply: {
                        title: "BREAKING NEWS",
                        body: title,
                        mediaType: 1,
                        thumbnailUrl: thumb,
                        sourceUrl: link,
                        renderLargerThumbnail: true,
                        showAdAttribution: true
                    }
                }
            }, { quoted: msg });

        } catch (e) {
            console.error("Masterpiece Error:", e.message);
            // This ensures you get a "Custom" log, not a generic one
            await sock.sendMessage(from, { 
                text: `⚠️ *V_HUB ERROR:* The Citizen News Vault is heavily encrypted or the site is down.\n\n_Reason: ${e.message}_` 
            });
        }
    }
};
