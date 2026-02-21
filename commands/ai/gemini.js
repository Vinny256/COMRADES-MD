const axios = require('axios');

module.exports = {
    name: 'gemini', // Keeping the name so your users don't have to change their habits
    category: 'ai',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");
        const apiKey = process.env.GROQ_API_KEY;

        const spark = "\u2728"; 
        const flower = "\u2740"; 
        const crystal = "\u10112"; 
        const leaf = "\uD83C\uDF3F"; 

        if (!text) return sock.sendMessage(from, { text: `${flower} *V_HUB:* What's on your mind? ${leaf}` });

        const { key: msgKey } = await sock.sendMessage(from, { 
            text: `┏━━━━━━ ${crystal} ━━━━━━┓\n   ${spark} *V_HUB AI* ${spark}\n  ${leaf} *Thinking...* ${leaf}\n┗━━━━━━ \uD83C\uDF38 ━━━━━━┛` 
        }, { quoted: m });

        try {
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "You are V_HUB AI, a helpful and elegant assistant." },
                    { role: "user", content: text }
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const reply = response.data.choices[0].message.content;
            const styledMsg = `✧─── 🌸 *V_HUB AI (GROQ)* 🌸 ───✧\n\n${reply}\n\n✧──── ❀ ${crystal} ❀ ────✧`;

            await sock.sendMessage(from, { text: styledMsg, edit: msgKey });
            process.stdout.write(`🚀 [GROQ SUCCESS] Fast response sent to ${from}\n`);

        } catch (e) {
            const errorMsg = e.response?.data?.error?.message || e.message;
            process.stdout.write(`🚀 [GROQ ERROR] ${errorMsg}\n`);

            await sock.sendMessage(from, { 
                text: `❌ *V_HUB:* System hiccup! ${errorMsg}`, 
                edit: msgKey 
            });
        }
    }
};