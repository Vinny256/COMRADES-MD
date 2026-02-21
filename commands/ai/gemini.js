const axios = require('axios');

// This object will hold chat history in RAM
// Format: { "user_number": [{role, content}, ...] }
const chatMemory = {}; 

module.exports = {
    name: 'gemini',
    category: 'ai',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");
        const apiKey = process.env.GROQ_API_KEY;

        if (!text) return sock.sendMessage(from, { text: "❀ *V_HUB:* What's on your mind? 𖤣𖥧" });

        const { key: msgKey } = await sock.sendMessage(from, { 
            text: "┏━━━━━━ 💠 ━━━━━━┓\n   ✨ *V_HUB AI* ✨\n  🌿 *Thinking...* 🌿\n┗━━━━━━ 🌸 ━━━━━━┛" 
        }, { quoted: m });

        try {
            // --- 🧠 MEMORY LOGIC ---
            // Initialize memory for new users
            if (!chatMemory[from]) {
                chatMemory[from] = [
                    { role: "system", content: "You are V_HUB AI, a helpful and elegant assistant. You remember previous parts of this conversation." }
                ];
            }

            // Add the new user message to memory
            chatMemory[from].push({ role: "user", content: text });

            // Keep only the last 10 messages to save space/RAM
            if (chatMemory[from].length > 11) {
                chatMemory[from].splice(1, 2); // Remove oldest exchange, keep system prompt
            }

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: chatMemory[from], // Send the WHOLE history
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            const reply = response.data.choices[0].message.content;

            // Add the AI response to memory so it remembers what it said!
            chatMemory[from].push({ role: "assistant", content: reply });

            const styledMsg = `✧─── 🌸 *V_HUB AI (GROQ)* 🌸 ───✧\n\n${reply}\n\n✧──── ❀ 💠 ❀ ────✧`;

            await sock.sendMessage(from, { text: styledMsg, edit: msgKey });

        } catch (e) {
            const errorMsg = e.response?.data?.error?.message || e.message;
            process.stdout.write(`🚀 [GROQ ERROR] ${errorMsg}\n`);
            await sock.sendMessage(from, { text: `❌ *V_HUB:* ${errorMsg}`, edit: msgKey });
        }
    }
};