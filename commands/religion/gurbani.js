const axios = require('axios');

module.exports = {
    name: "gurbani",
    category: "religion",
    desc: "Get a random Shabad (verse) from Gurbani",
    async execute(sock, msg, args, { from }) {
        try {
            const { data } = await axios.get('https://api.gurbaninow.com/v2/shabad/random');
            const verse = data.shabad[0].line.larivaar.unicode;
            const translation = data.shabad[0].line.translation.english.default;

            const response = `┏━━━━━ ✿ *GURBANI* ✿ ━━━━━┓\n\nੴ *Verse:* ${verse}\n📜 *English:* ${translation}\n\n┗━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: response }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Connection to Gurbani server failed." });
        }
    }
};