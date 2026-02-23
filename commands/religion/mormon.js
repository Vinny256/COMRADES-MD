const axios = require('axios');

module.exports = {
    name: "mormon",
    category: "religion",
    desc: "Get a verse from the Book of Mormon",
    async execute(sock, msg, args, { from }) {
        const query = args.join(" "); // e.g., 1 Nephi 1:1
        if (!query) return sock.sendMessage(from, { text: "⛪ Usage: .mormon 1 Nephi 1:1" });

        try {
            const { data } = await axios.get(`https://api.nephi.org/scriptures/?q=${encodeURIComponent(query)}`);
            const verse = data.scriptures[0];
            
            const response = `┏━━━━━ ✿ *BOOK OF MORMON* ✿ ━━━━━┓\n\n📖 *Ref:* ${verse.reference}\n📜 *Text:* ${verse.text}\n\n┗━━━━━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: response }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Verse not found. Example: .mormon 1 Nephi 1:1" });
        }
    }
};