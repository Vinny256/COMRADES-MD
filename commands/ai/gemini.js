const axios = require('axios');

module.exports = {
    name: 'gemini',
    category: 'ai',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");
        const key = process.env.GEMINI_API_KEY;

        if (!text) return sock.sendMessage(from, { text: "❀ *V_HUB:* What's on your mind? 𖤣𖥧" });

        // Styled Loading
        const { key: msgKey } = await sock.sendMessage(from, { 
            text: "┏━━━━━━ 💠 ━━━━━━┓\n   ✨ *V_HUB AI* ✨\n  🌿 *Thinking...* 🌿\n┗━━━━━━ 🌸 ━━━━━━┛" 
        }, { quoted: m });

        try {
            // We call the STABLE v1 API directly, bypassing the buggy library
            const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
            
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: text }] }]
            }, { headers: { 'Content-Type': 'application/json' } });

            const reply = response.data.candidates[0].content.parts[0].text;

            const styledMsg = `✧─── 🌸 *GEMINI STABLE* 🌸 ───✧\n\n${reply}\n\n✧──── ❀ 💠 ❀ ────✧`;

            await sock.sendMessage(from, { text: styledMsg, edit: msgKey });
            process.stdout.write(`🚀 [AI SUCCESS] Gemini Stable responded.\n`);

        } catch (e) {
            // Log the detailed error from Google's server
            const errorDetail = e.response?.data?.error?.message || e.message;
            process.stdout.write(`🚀 [AI ERROR] Gemini Stable failed: ${errorDetail}\n`);

            await sock.sendMessage(from, { 
                text: `❌ *V_HUB:* Google Error: ${errorDetail}`, 
                edit: msgKey 
            });
        }
    }
};