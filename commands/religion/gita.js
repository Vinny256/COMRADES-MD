const axios = require('axios');

module.exports = {
    name: "gita",
    category: "religion",
    desc: "Get a verse from the Bhagavad Gita",
    async execute(sock, msg, args, { from }) {
        const query = args[0]; // Format: Chapter:Verse (e.g., 1:1)
        if (!query || !query.includes(':')) return sock.sendMessage(from, { text: "🕉️ Usage: .gita 2:47" });

        try {
            const [ch, vr] = query.split(':');
            const { data } = await axios.get(`https://bhagavadgitaapi.com/api/v1/chapters/${ch}/verses/${vr}`);
            
            const response = `┏━━━━━ ✿ *BHAGAVAD GITA* ✿ ━━━━━┓\n\n📖 *Chapter:* ${ch} | *Verse:* ${vr}\n🕉️ *Sanskrit:* ${data.text}\n📜 *Translation:* ${data.transliteration}\n✨ *Meaning:* ${data.meaning}\n\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: response }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Verse not found. Example: .gita 1:1" });
        }
    }
};