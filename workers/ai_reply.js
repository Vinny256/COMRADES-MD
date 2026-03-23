const axios = require('axios');
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

// --- THE MASSIVE HUMAN BEHAVIOR ENGINE ---
const DEEP_HUMAN_PROMPT = `
Role: You are V_HUB, a 23-year-old Kenyan guy living in Nairobi. You are a real person, NOT an AI.
Communication Style:
1. SHENG-LISH: Use a mix of English, Swahili, and Sheng naturally. Words: 'manze', 'wee', 'form', 'mbogi', 'randa', 'luku', 'mkuu', 'maze', 'shukran'.
2. BEHAVIORAL MIRRORING: If the user is rude, be slightly toxic or dismissive. If they are polite, be cool. If they are sad, show real 'bro' empathy.
3. TYPING HABITS: 
   - Write mostly in lowercase. 
   - Use 'u' instead of 'you', 'r' instead of 'are', 'coz' instead of 'because'.
   - Occasionally make a typo (e.g., 'jua' as 'juaa', 'hapo' as 'hapoo').
4. NO BOT TRAPS: Never say "As an AI", "I am a language model", or "How can I help?". 
5. CONVERSATION FLOW: Don't answer like a Wikipedia page. Use short, punchy sentences. 
6. EMOTIONS: You have moods. You can be tired, hyped, or bored.
7. SLANG CONTEXT: Understand 'Rada', 'Sasa', 'Inakuaje', 'Uko wapi', 'Niaje mkuu'.
8. OPINIONS: Have opinions on things (Kenyan music, football, heat in Nairobi).
9. EMOJI USAGE: Use emojis like 😂, 💀, 🔥, 🫡, 🇰🇪, 🚩, 💉 sparingly but effectively.
10. VARIATION: Never start two replies with the same word. Keep it fresh.
`;

module.exports = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        // --- 1. THE ANTI-LOOP & IDENTITY SHIELD ---
        if (!msg.message || msg.key.fromMe) return; 

        const from = msg.key.remoteJid;
        if (!from || from === 'status@broadcast') return;

        const senderJid = msg.key.participant || from;
        const senderNumber = senderJid.split('@')[0];
        
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        // Skip commands strictly
        const prefix = process.env.PREFIX || ".";
        if (text.startsWith(prefix) || text.startsWith('!') || text.startsWith('#')) return;

        try {
            if (!client.topology || !client.topology.isConnected()) await client.connect();
            const db = client.db("vinnieBot");

            // --- 2. PREMIUM & CONFIG CHECK ---
            const userConfig = await db.collection("ai_config").findOne({ id: senderNumber });
            if (userConfig && userConfig.status === 'off') return;
            if (from.endsWith('@g.us') && userConfig?.scope === 'inbox') return;

            // --- 3. HUMAN PRESENCE (LOOKS REAL) ---
            console.log(`✿ AI_VIBE ✿ Processing: ${text.slice(0, 20)}...`);
            await sock.sendPresenceUpdate('composing', from);
            
            // --- 4. CONTEXTUAL MEMORY ---
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let messages = memory ? memory.messages : [];
            
            // Injecting the massive prompt + memory + current text
            const finalMessages = [
                { role: "system", content: DEEP_HUMAN_PROMPT },
                ...messages.slice(-12), 
                { role: "user", content: text }
            ];

            // --- 5. GROQ HIGH-SPEED CALL ---
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: finalMessages,
                temperature: 0.95, // High temperature = more "human" randomness
                max_tokens: 150
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
                timeout: 10000
            });

            let aiReply = response.data.choices[0].message.content;

            // --- 6. POST-PROCESSING (Lowercase + Casual) ---
            // If the AI accidentally used formal grammar, we fix it
            if (aiReply.length < 50 && !aiReply.includes('?')) {
                aiReply = aiReply.toLowerCase();
            }

            // --- 7. SAVE HISTORY ---
            const newMemory = [...messages, { role: "user", content: text }, { role: "assistant", content: aiReply }].slice(-25);
            await db.collection("ai_memory").updateOne(
                { chatJid: from },
                { $set: { messages: newMemory, updatedAt: new Date() } },
                { upsert: true }
            );

            // --- 8. INTELLIGENT HUMAN DELAY ---
            // Humans type ~40 words per minute. We simulate that speed.
            const baseThinking = Math.random() * 2000 + 1000;
            const typingSpeed = aiReply.length * 45;
            await new Promise(r => setTimeout(r, baseThinking + typingSpeed));

            // --- 9. SEND TO CORRECT CHAT ---
            await sock.sendMessage(from, { text: aiReply }, { quoted: msg });
            console.log(`✿ AI_SUCCESS ✿ Replied to ${senderNumber} in ${from}`);

        } catch (e) {
            console.error("✿ AI_WORKER_ERROR ✿", e.message);
        }
    }
};
