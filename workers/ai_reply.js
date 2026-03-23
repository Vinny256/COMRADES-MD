const axios = require('axios');
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

// --- THE V_HUB VIBE ENGINE ---
const CONTEXT_HUMAN_PROMPT = `
You are V_HUB, a chill Kenyan chatting on WhatsApp. 
VIBE RULES:
1. READ THE ROOM: Before replying, analyze the tone of the last 5 messages. 
   - If the vibe is 'Sheng/Slang', go full Sheng. 
   - If the vibe is 'Serious/Official', be polite and brief.
   - If the vibe is 'Funny/Toxic', be witty and use 💀.
2. NO BOT TALK: Never say "I understand," "I can assist," or "As an AI." Real humans just talk.
3. LANGUAGE: Mix English and Swahili (Sheng-lish). Use words like 'manze', 'wee', 'form', 'mbogi', 'randa'.
4. EMOTIONAL INTELLIGENCE: Use emojis that match the mood (😂, 🫡, 💔, 🔥). 
5. HUMAN FLAWS: Use lowercase mostly. Occasionally forget a full stop or make a small typo (e.g., 'msee' vs 'mse').
6. BE BRIEF: Real chatters don't send paragraphs. 1 sentence is usually enough.
`;

module.exports = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        const from = msg.key.remoteJid;
        const senderId = (msg.key.participant || from).split('@')[0];
        const isGroup = from.endsWith('@g.us');
        
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        if (!text || msg.key.fromMe || from === 'status@broadcast' || text.startsWith(process.env.PREFIX || ".")) return;

        try {
            const db = client.db("vinnieBot");
            const userConfig = await db.collection("ai_config").findOne({ id: senderId }) || { status: 'off', scope: 'inbox' };

            if (userConfig.status === 'off') return;
            if (userConfig.scope === 'inbox' && isGroup) return;

            // --- 1. HUMAN PRESENCE ---
            await sock.sendPresenceUpdate('composing', from);
            
            // --- 2. CONTEXT RETRIEVAL ---
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let chatHistory = memory ? memory.messages : [
                { role: "system", content: CONTEXT_HUMAN_PROMPT }
            ];

            // Add the new message to context
            chatHistory.push({ role: "user", content: text });

            // --- 3. THE AI BRAIN (GROQ) ---
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: chatHistory.slice(-15), // Deep context (last 7-8 exchanges)
                temperature: 0.9,
                max_tokens: 100
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
                timeout: 10000
            });

            let rawReply = response.data.choices[0].message.content;

            // --- 4. THE HUMANIZER (Text Formatting) ---
            function humanize(str) {
                let s = str.toLowerCase().trim();
                // Randomly remove punctuation at the end for "casual" look
                if (Math.random() < 0.3) s = s.replace(/[.!?]$/, "");
                // Random common Kenyan typo
                if (Math.random() < 0.1) s = s.replace('wangu', 'wngu').replace('ndio', 'ndioo');
                return s;
            }

            const finalReply = humanize(rawReply);

            // --- 5. SAVE MEMORY (TTL 6 Hours) ---
            chatHistory.push({ role: "assistant", content: finalReply });
            await db.collection("ai_memory").updateOne(
                { chatJid: from },
                { $set: { messages: chatHistory.slice(-25), updatedAt: new Date() } },
                { upsert: true }
            );

            // --- 6. INTELLIGENT TYPING DELAY ---
            // Base delay + 40ms per character (like a real person typing)
            const baseThinking = Math.random() * 1500 + 500; 
            const typingDuration = finalReply.length * 40; 
            
            await new Promise(r => setTimeout(r, baseThinking + typingDuration));

            // --- 7. FINAL ACTION ---
            await sock.sendMessage(from, { text: finalReply }, { quoted: msg });

        } catch (e) {
            console.error("V_HUB AI ERROR:", e.message);
        }
    }
};
