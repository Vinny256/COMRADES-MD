const axios = require('axios');

module.exports = {
    name: "quran",
    category: "religion",
    desc: "Get a specific Quranic verse",
    async execute(sock, msg, args, { from }) {
        const query = args[0]; // Format: Surah:Ayah
        if (!query || !query.includes(':')) {
            return sock.sendMessage(from, { text: "🌙 Usage: .quran 2:255" });
        }

        try {
            const [surah, ayah] = query.split(':');
            const { data } = await axios.get(`http://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`);
            
            const response = `┏━━━━━ ✿ *QURAN* ✿ ━━━━━┓\n\n📖 *Surah:* ${data.data.surah.englishName}\n🔢 *Ayah:* ${data.data.numberInSurah}\n📜 *Text:* ${data.data.text}\n\n┗━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: response }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Verse not found. Format is Surah:Ayah (e.g., .quran 1:1)" });
        }
    }
};