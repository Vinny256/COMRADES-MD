const { GoogleGenerativeAI } = require("@google/generative-ai");

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
                text: `${flower} *V_HUB:* Please provide a prompt. ${leaf}` 
            });
        }

        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━━ ${crystal} ━━━━━━┓\n   ${spark} *V_HUB AI* ${spark}\n  ${leaf} *Thinking...* ${leaf}\n┗━━━━━━ \uD83C\uDF38 ━━━━━━┛`.trim()
        }, { quoted: m });

        try {
            // Initialize Official Google AI
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(text);
            const response = await result.response;
            const reply = response.text();

            const styledMsg = `
${diamond}─── \uD83C\uDF38 *OFFICIAL GEMINI* \uD83C\uDF38 ───${diamond}

*${leaf} User:* _${text}_

*📝 Response:*
${reply}

${diamond}──── ${flower} ${crystal} ${flower} ────${diamond}
            `.trim();

            await sock.sendMessage(from, { text: styledMsg, edit: key });
            process.stdout.write(`🚀 [AI SUCCESS] Official Gemini responded to ${from}\n`);

        } catch (e) {
            process.stdout.write(`🚀 [AI ERROR] Official Gemini failed: ${e.message}\n`);
            
            await sock.sendMessage(from, { 
                text: "❌ *V_HUB:* Google API is reaching its limit or key is invalid. 🌸", 
                edit: key 
            });
        }
    }
};