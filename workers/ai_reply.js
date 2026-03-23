const axios = require('axios');
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

// --- THE HUMAN BRAIN PROMPT ---
const HUMAN_PERSONA = `
You are V_HUB, a real human from Kenya. 
CRITICAL RULES:
1. NEVER act like a bot. No "How can I help you?", no "As an AI model...". 
2. LANGUAGE: Use 'Sheng-lish'. Mix English, Swahili, and Sheng (e.g., 'Sasa msee', 'Form ni gani?', 'Niko fiti').
3. EMOTION: If the user is happy, be hyped. If they are sad, be a real friend. Match their tone exactly.
4. TEXT STYLE: Keep replies short (1-2 sentences). Most Kenyans type in lowercase and use slang.
5. NO ESSAYS: Don't give instructions unless specifically asked. Just chat.
6. VARIATION: Use emojis like 💀, 😂, 🔥, 🫡, and 🇰🇪 naturally.
`;

module.exports = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        const from = msg.key.remoteJid;
        const senderJid = msg.key.participant || from;
        const senderId = senderJid.split('@')[0];
        const isGroup = from.endsWith('@g.us');
        
        // 1. Basic Filters
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        // Don't reply if: No text, it's from the bot, it's a status, or it's a command
        if (!text || msg.key.fromMe || from === 'status@broadcast' || text.startsWith(process.env.PREFIX || ".")) return;

        try {
            const db = client.db("vinnieBot");
            
            // 2. Fetch User Config (from your .autoreply command)
            const userConfig = await db.collection("ai_config").findOne({ id: senderId }) || { status: 'off', scope: 'inbox' };

            if (userConfig.status === 'off') return;
            if (userConfig.scope === 'inbox' && isGroup) return;

            // 3. Start "Typing..." Presence
            await sock.sendPresenceUpdate('composing', from);
            
            // 4. Memory Retrieval & Context Building
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let chatHistory = memory ? memory.messages : [
                { role: "system", content: HUMAN_PERSONA }
            ];

            // Add Examples for the AI to follow (Few-Shot) if memory is new
            if (!memory) {
                chatHistory.push(
                    { role: "user", content: "Sasa" },
                    { role: "assistant", content: "Sasa msee! Form ni gani leo? 👊" },
                    { role: "user", content: "Who are you?" },
                    { role: "assistant", content: "Ni V_HUB hapa... kwani unadhani mimi ni nani? 😂" }
                );
            }

            chatHistory.push({ role: "user", content: text });

            // 5. Groq API Call
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: chatHistory.slice(-12), // Keep context of last ~6-8 exchanges
                temperature: 0.9, // Higher randomness for more "human" variety
                max_tokens: 150
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
                timeout: 10000
            });

            let rawReply = response.data.choices[0].message.content;

            // 6. HUMANIZER: Make it look typed by a real person
            function humanize(str) {
                let s = str.toLowerCase(); // Kenyans mostly use lowercase in DM
                if (Math.random() < 0.15) { // 15% chance of a common chat typo
                    s = s.replace('that', 'thta').replace('just', 'jst').replace('the', 'teh');
                }
                return s;
            }

            const finalReply = humanize(rawReply);

            // 7. Save to MongoDB (TTL resets to 6 hours)
            chatHistory.push({ role: "assistant", content: finalReply });
            await db.collection("ai_memory").updateOne(
                { chatJid: from },
                { $set: { messages: chatHistory.slice(-20), updatedAt: new Date() } },
                { upsert: true }
            );

            // 8. Human-like Delay (Based on text length + random thinking)
            const typingTime = (finalReply.length * 50) + (Math.random() * 2000 + 1000);
            await new Promise(r => setTimeout(r, typingTime));

            // 9. Send Final Message
            await sock.sendMessage(from, { text: finalReply }, { quoted: msg });

        } catch (e) {
            console.error("AI WORKER ERROR:", e.message);
        }
    }
};
