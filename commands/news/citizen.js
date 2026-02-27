const axios = require('axios');
const cheerio = require('cheerio');
const Parser = require('rss-parser'); // npm install rss-parser

module.exports = {
    name: "citizen",
    category: "news",
    async execute(sock, msg, args, { from, prefix }) {
        await sock.sendMessage(from, { react: { text: "🔍", key: msg.key } });

        try {
            // Try RSS first for reliability
            let title, link, thumb = "https://i.imgur.com/XHUY4VI.jpeg";
            const parser = new Parser();
            const feed = await parser.parseURL('https://www.citizen.digital/rss');
            const latest = feed.items[0];
            if (latest) {
                title = latest.title;
                link = latest.link;
                thumb = latest.enclosure?.url || thumb;
            } else {
                // Fallback to scraping
                const { data } = await axios.get('https://www.citizen.digital/news', {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                    },
                    timeout: 10000
                });
                const $ = cheerio.load(data);
                const story = $('.story, .article, a[href*="/news/"]').first();
                title = story.find('h1, h2, h3, .headline, .title').first().text().trim() || $("meta[property='og:title']").attr('content');
                link = story.attr('href') || $("meta[property='og:url']").attr('content');
                if (!link) throw new Error("No story found");
                link = link.startsWith('http') ? link : `https://www.citizen.digital${link}`;
                thumb = story.find('img').attr('src') || $("meta[property='og:image']").attr('content') || thumb;
            }

            await sock.sendMessage(from, {
                image: { url: thumb },
                caption: `*🗞️ CITIZEN LATEST*\n\n*${title}*\n\n_Source: Citizen Digital Kenya_`,
                footer: "© 2026 | VINNIE NEWS HUB",
                buttons: [
                    { buttonId: `read_${link}`, buttonText: { displayText: '📖 Read More' }, type: 1 },
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
            console.error("Citizen Error:", e);
            await sock.sendMessage(from, { 
                text: `⚠️ *V_HUB ERROR:* Could not fetch Citizen news.\n\n_Reason: ${e.message}_` 
            });
        }
    }
};
