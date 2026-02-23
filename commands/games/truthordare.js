module.exports = {
    name: "toda",
    category: "games",
    desc: "Classic Truth or Dare game",
    async execute(sock, msg, args, { from }) {
        const type = args[0]?.toLowerCase();

        const truths = [
            "What is your biggest fear in a relationship?",
            "What is the most embarrassing thing you've ever done?",
            "If you could be invisible for a day, what would you do?",
            "Have you ever lied to your best friend?",
            "What is the weirdest habit you have?",
            "Who is your secret crush in this group?",
            "What is the most childish thing you still do?",
            "Have you ever ghosted someone?",
            "What’s the most expensive thing you’ve ever stolen?"
        ];

        const dares = [
            "Send a voice note singing your favorite song.",
            "Text your ex 'I still miss you' and send a screenshot here.",
            "Change your WhatsApp bio to 'I am a potato' for 1 hour.",
            "Send the 5th photo in your gallery.",
            "Voice note yourself screaming like a goat.",
            "Send a message to your crush right now.",
            "Describe the person you like using only emojis.",
            "Do 20 pushups and record the audio of you panting.",
            "Tell the group a secret you've never told anyone."
        ];

        if (type === 'truth') {
            const randomTruth = truths[Math.floor(Math.random() * truths.length)];
            const response = `┏━━━━━ ✿ *V_HUB TRUTH* ✿ ━━━━━┓\n┃\n┃  🤔 *Question:* \n┃  👉 ${randomTruth}\n┃\n┃  _Answer honestly!_\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: response }, { quoted: msg });

        } else if (type === 'dare') {
            const randomDare = dares[Math.floor(Math.random() * dares.length)];
            const response = `┏━━━━━ ✿ *V_HUB DARE* ✿ ━━━━━┓\n┃\n┃  🔥 *Challenge:* \n┃  👉 ${randomDare}\n┃\n┃  _No backing out now!_\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: response }, { quoted: msg });

        } else {
            const menu = `┏━━━━━ ✿ *TRUTH OR DARE* ✿ ━━━━━┓\n┃\n┃  Choose your fate:\n┃\n┃  👉 *.toda truth*\n┃  👉 *.toda dare*\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: menu }, { quoted: msg });
        }
    }
};