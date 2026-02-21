const axios = require('axios');
const https = require('https');

module.exports = {
    name: 'gemini',
    category: 'ai',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");

        const spark = "\u2728"; 
        const flower = "\u2740"; 
        const diamond = "\u2727"; 
        const crystal = "\u10112"; 
        const leaf = "\uD83C\uDF3F"; 

        if (!text) {
            return sock.sendMessage(from, { 
                text: `${flower} *V_HUB:* What would you like to ask? ${leaf}` 
            });
        }

        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━━ ${crystal} ━━━━━━┓\n   ${spark} *V_HUB AI* ${spark}\n  ${leaf} *Thinking...* ${leaf}\n┗━━━━━━ \uD83C\uDF38 ━━━━━━┛`.trim()
        }, { quoted: m });

        try {
            // --- 🛡️ STABILITY UPGRADE ---
            // We use a different endpoint and ignore SSL 'EPROTO' errors
            const response = await axios.get(`https://hercai.onrender.com/v3/gemini?question=${encodeURIComponent(text)}`, {
                timeout: 25000,
                httpsAgent: new https.Agent({ rejectUnauthorized: false }) 
            });
            
            const reply = response.data.reply;

            const styledMsg = `
${diamond}─── \uD83C\uDF38 *GEMINI AI* \uD83C\uDF38 ───${diamond}

*${leaf} User:* _${text}_

*📝 Response:*
${reply}

${diamond}──── ${flower} ${crystal} ${flower} ────${diamond}
            `.trim();

            await sock.sendMessage(from, { text: styledMsg, edit: key });
            process.stdout.write(`🚀 [AI SUCCESS] Gemini responded to ${from}\n`);

        } catch (e) {
            process.stdout.write(`🚀 [AI ERROR] Gemini failed: ${e.message}\n`);

            await sock.sendMessage(from, { 
                text: "❌ *V_HUB:* The AI server is currently unreachable. Please try again in a moment. 🌸", 
                edit: key 
            });
        }
    }
};