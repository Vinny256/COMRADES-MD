const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: "citizen",
    category: "news",
    async execute(sock, msg, args, { from }) {
        await sock.sendMessage(from, { react: { text: "📰", key: msg.key } });

        try {
            const { data } = await axios.get('https://www.citizen.digital/news');
            const $ = cheerio.load(data);
            
            // We grab the first (latest) news item to create the Card
            const latest = $('.headline').first();
            const title = latest.text().trim();
            const link = "https://www.citizen.digital" + latest.find('a').attr('href');
            const img = "https://i.imgur.com/XHUY4VI.jpeg"; // Default banner

            // --- 🗂️ THE CAROUSEL CARD LAYOUT ---
            const sections = [
                {
                    title: "🗞️ Latest News Headlines",
                    rows: [
                        { title: "📖 Read Full Story", rowId: `${prefix}getnews ${link}`, description: title },
                        { title: "🔗 Copy Link", rowId: `${prefix}copy ${link}`, description: "Get URL to share" }
                    ]
                }
            ];

            const listMessage = {
                text: `\n*${title}*\n\nPSK condemns secret recording of former DP Gachagua at pharmacy...`,
                footer: "© 2026 | Vinnie News Hub",
                title: "💠 CITIZEN DIGITAL NEWS",
                buttonText: "📰 View Story Options",
                sections,
                contextInfo: {
                    externalAdReply: {
                        title: "BREAKING: CITIZEN TV",
                        body: "Tap for the latest updates",
                        thumbnailUrl: img,
                        mediaType: 1,
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            };

            await sock.sendMessage(from, listMessage, { quoted: msg });

        } catch (e) {
            await sock.sendMessage(from, { text: "⚠️ News Vault currently locked." });
        }
    }
};
