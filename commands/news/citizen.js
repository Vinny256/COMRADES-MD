const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: "citizen",
    category: "news",
    async execute(sock, msg, args, { from, prefix }) {
        await sock.sendMessage(from, { react: { text: "🔓", key: msg.key } });

        try {
            // 🌐 Fetching with a real browser header to bypass the 'Lock'
            const { data } = await axios.get('https://www.citizen.digital/news', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            const $ = cheerio.load(data);
            
            // Grabbing the very first breaking news item
            const firstNews = $('a.relative.block').first();
            const title = firstNews.find('h1, h2, h3').first().text().trim() || "Latest Headline";
            const link = firstNews.attr('href').startsWith('http') ? firstNews.attr('href') : "https://www.citizen.digital" + firstNews.attr('href');
            const thumb = firstNews.find('img').attr('data-src') || firstNews.find('img').attr('src') || "https://i.imgur.com/XHUY4VI.jpeg";

            // --- 🗂️ THE CAROUSEL LIST ---
            const sections = [
                {
                    title: "📰 TOP STORY OPTIONS",
                    rows: [
                        { title: "📖 Read Full Article", rowId: `${prefix}readnews ${link}`, description: "Open full story in browser" },
                        { title: "🔗 Share Link", rowId: `${prefix}copy ${link}`, description: "Get the URL to share with friends" }
                    ]
                }
            ];

            const listMessage = {
                text: `\n🔥 *BREAKING NEWS*\n\n*${title}*\n\n_Stay updated with Vinnie Digital Hub for real-time news alerts across Kenya._`,
                footer: "© 2026 | VINNIE NEWS VAULT",
                title: "💠 CITIZEN DIGITAL NEWS",
                buttonText: "SELECT ACTION",
                sections,
                contextInfo: {
                    // This forces the "Big Card" look from your screenshot
                    externalAdReply: {
                        title: "CITIZEN TV: LIVE UPDATES",
                        body: title,
                        thumbnailUrl: thumb,
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: true,
                        sourceUrl: link
                    }
                }
            };

            await sock.sendMessage(from, listMessage, { quoted: msg });

        } catch (e) {
            console.error("Scraper Error:", e.message);
            await sock.sendMessage(from, { text: `⚠️ *News Vault Lock:* Site is currently unreachable. Try again in 5 minutes.` });
        }
    }
};
