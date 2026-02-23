const axios = require('axios');

module.exports = {
    name: "buddha",
    category: "religion",
    desc: "Get Buddhist wisdom/quotes",
    async execute(sock, msg, args, { from }) {
        try {
            // Using an open-source quote API for spiritual wisdom
            const { data } = await axios.get('https://zenquotes.io/api/random');
            const response = `┏━━━━━ ✿ *WISDOM* ✿ ━━━━━┓\n\n☸️ *Quote:* ${data[0].q}\n🙏 *Author:* ${data[0].a}\n\n┗━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: response }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Spiritual connection lost. Try again later." });
        }
    }
};