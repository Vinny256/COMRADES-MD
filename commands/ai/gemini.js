const axios = require('axios');

module.exports = {
    name: 'gemini',
    category: 'ai',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");

        if (!text) {
            return sock.sendMessage(from, { 
                text: "❀ *V_HUB:* What would you like to ask? 𖤣𖥧" 
            });
        }

        // --- 🌸 STYLED LOADING MESSAGE ---
        const { key } = await sock.sendMessage(from, { 
            text: `
┏━━━━━━ 💠 ━━━━━━┓
     ✨ *V_HUB AI* ✨
  𖤣𖥧 *Thinking...* 𖤣𖥧
┗━━━━━━ 🌸 ━━━━━━┛`.trim()
        }, { quoted: m });

        try {
            const response = await axios.get(`https://api.hercai.com/v3/gemini?question=${encodeURIComponent(text)}`, { timeout: 20000 });
            const reply = response.data.reply;

            // --- 💐 THE BOTANICAL FRAME ---
            const styledMsg = `
✧─── 🌸 *GEMINI AI* 🌸 ───✧

*𖤣𖥧 User:* _${text}_

*📝 Response:*
${reply}

✧──── ❀ 💠 ❀ ────✧
            `.trim();

            // Edit the loading message into the beautiful response
            await sock.sendMessage(from, { 
                text: styledMsg, 
                edit: key 
            });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: "❌ *V_HUB:* The flower garden is resting (Service Offline).", 
                edit: key 
            });
        }
    }
};