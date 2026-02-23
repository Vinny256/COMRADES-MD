const axios = require('axios');

module.exports = {
    name: "torah",
    category: "religion",
    desc: "Get a verse from the Torah/Tanakh",
    async execute(sock, msg, args, { from }) {
        const query = args.join(" "); // e.g., Genesis 1:1
        if (!query) return sock.sendMessage(from, { text: "✡️ Usage: .torah Genesis 1:1" });

        try {
            const { data } = await axios.get(`https://www.sefaria.org/api/texts/${encodeURIComponent(query)}`);
            const text = data.text.replace(/<[^>]*>/g, ''); // Remove HTML tags
            
            const response = `┏━━━━━ ✿ *TANAKH* ✿ ━━━━━┓\n\n📖 *Ref:* ${data.ref}\n📜 *Text:* ${text}\n\n┗━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: response }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Text not found. Example: .torah Genesis 1:1" });
        }
    }
};