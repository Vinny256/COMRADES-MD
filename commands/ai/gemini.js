const axios = require('axios');

module.exports = {
    name: 'gemini',
    category: 'ai',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");

        // Unicode codes for a cleaner look
        const spark = "\u2728"; // ✨
        const flower = "\u2740"; // ❀
        const diamond = "\u2727"; // ✧
        const crystal = "\u10112"; // 💠
        const leaf = "\uD83C\uDF3F"; // 🌿

        if (!text) {
            return sock.sendMessage(from, { 
                text: `${flower} *V_HUB:* What would you like to ask? ${leaf}` 
            });
        }

        // --- 🌸 STYLED LOADING MESSAGE (Unicode Optimized) ---
        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━━ ${crystal} ━━━━━━┓\n   ${spark} *V_HUB AI* ${spark}\n  ${leaf} *Thinking...* ${leaf}\n┗━━━━━━ \uD83C\uDF38 ━━━━━━┛`.trim()
        }, { quoted: m });

        try {
            // Using a 20s timeout to prevent hanging
            const response = await axios.get(`https://api.hercai.com/v3/gemini?question=${encodeURIComponent(text)}`, { timeout: 20000 });
            const reply = response.data.reply;

            // --- 💐 THE BOTANICAL FRAME ---
            const styledMsg = `
${diamond}─── \uD83C\uDF38 *GEMINI AI* \uD83C\uDF38 ───${diamond}

*${leaf} User:* _${text}_

*📝 Response:*
${reply}

${diamond}──── ${flower} ${crystal} ${flower} ────${diamond}
            `.trim();

            await sock.sendMessage(from, { 
                text: styledMsg, 
                edit: key 
            });

            // Log success to terminal
            process.stdout.write(`🚀 [AI SUCCESS] Gemini responded to ${from}\n`);

        } catch (e) {
            // --- 🚨 CRITICAL: LOG THE ACTUAL ERROR TO TERMINAL ---
            // This bypasses your silence shield so you can see the 'Why'
            process.stdout.write(`🚀 [AI ERROR] Gemini failed: ${e.message}\n`);

            await sock.sendMessage(from, { 
                text: "❌ *V_HUB:* The flower garden is resting (Service Offline).", 
                edit: key 
            });
        }
    }
};