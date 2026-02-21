const axios = require('axios');

module.exports = {
    name: 'gemini',
    category: 'ai',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");
        const key = process.env.GEMINI_API_KEY;

        if (!text) return sock.sendMessage(from, { text: "❀ *V_HUB:* What's on your mind? 𖤣𖥧" });

        const { key: msgKey } = await sock.sendMessage(from, { 
            text: "┏━━━━━━ 💠 ━━━━━━┓\n   ✨ *V_HUB AI* ✨\n  🌿 *Thinking...* 🌿\n┗━━━━━━ 🌸 ━━━━━━┛" 
        }, { quoted: m });

        // List of models to try in order of speed/availability
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        let success = false;

        for (let modelName of models) {
            if (success) break;
            
            try {
                // Using v1beta as it's more flexible with Flash models
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;
                
                const response = await axios.post(url, {
                    contents: [{ parts: [{ text: text }] }]
                }, { headers: { 'Content-Type': 'application/json' }, timeout: 15000 });

                if (response.data.candidates && response.data.candidates[0].content) {
                    const reply = response.data.candidates[0].content.parts[0].text;
                    const styledMsg = `✧─── 🌸 *GEMINI (${modelName.toUpperCase()})* 🌸 ───✧\n\n${reply}\n\n✧──── ❀ 💠 ❀ ────✧`;
                    
                    await sock.sendMessage(from, { text: styledMsg, edit: msgKey });
                    process.stdout.write(`🚀 [AI SUCCESS] Responded using ${modelName}\n`);
                    success = true;
                }
            } catch (e) {
                process.stdout.write(`🚀 [AI RETRY] ${modelName} failed, trying next...\n`);
                // Continue to next model in loop
            }
        }

        if (!success) {
            process.stdout.write(`🚀 [AI ERROR] All Gemini models failed for this region/key.\n`);
            await sock.sendMessage(from, { 
                text: "❌ *V_HUB:* Google AI is currently restricted in your region or your API key is invalid. 🌸", 
                edit: msgKey 
            });
        }
    }
};