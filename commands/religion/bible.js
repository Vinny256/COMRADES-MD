const axios = require('axios');

module.exports = {
    name: "bible",
    category: "religion",
    desc: "Get a specific Bible verse",
    async execute(sock, msg, args, { from }) {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(from, { text: "📖 Usage: .bible John 3:16" });

        try {
            const { data } = await axios.get(`https://bible-api.com/${encodeURIComponent(query)}`);
            const response = `┏━━━━━ ✿ *BIBLE* ✿ ━━━━━┓\n\n📖 *Ref:* ${data.reference}\n📜 *Text:* ${data.text.trim()}\n\n┗━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: response }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Verse not found. Example: .bible Genesis 1:1" });
        }
    }
};