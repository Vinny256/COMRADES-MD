const axios = require('axios');
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

const CONTEXT_HUMAN_PROMPT = `You are V_HUB, a chill Kenyan. Use Sheng/Swahili. Be brief and human. Never say you are an AI.`;

module.exports = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        // --- THE FIX: 'from' is the chat room, 'sender' is the person ---
        const from = msg.key.remoteJid;
        if (!from || from === 'status@broadcast' || msg.key.fromMe) return;

        const senderJid = msg.key.participant || from;
        const senderNumber = senderJid.split('@')[0];
        
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        // Skip commands
        const prefix = process.env.PREFIX || ".";
        if (text.startsWith(prefix) || text.startsWith('!') || text.startsWith('#')) return;

        try {
            if (!client.topology || !client.topology.isConnected()) await client.connect();
            const db = client.db("vinnieBot");

            // --- 1. CONFIG CHECK ---
            const userConfig = await db.collection("ai_config").findOne({ id: senderNumber });
            
            // If feature is OFF, stop here.
            if (userConfig && userConfig.status === 'off') return;
            
            // Logic for Inbox vs All
            const isGroup = from.endsWith('@g.us');
            if (userConfig && userConfig.scope === 'inbox' && isGroup) return;

            // --- 2. START TYPING ---
            console.log(`✿ HUB_SYNC ✿ AI Triggered in chat: ${from}`);
            await sock.sendPresenceUpdate('composing', from);
            
            // --- 3. MEMORY ---
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let chatHistory = memory ? memory.messages : [{ role: "system", content: CONTEXT_HUMAN_PROMPT }];
            chatHistory.push({ role: "user", content: text });

            // --- 4. CALL GROQ ---
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: chatHistory.slice(-12),
                temperature: 0.9
            }, {
                headers: { 
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });

            const aiReply = response.data.choices[0].message.content.toLowerCase();

            // --- 5. SAVE ---
            await db.collection("ai_memory").updateOne(
                { chatJid: from },
                { $set: { messages: [...chatHistory, { role: "assistant", content: aiReply }].slice(-20), updatedAt: new Date() } },
                { upsert: true }
            );

            // --- 6. HUMAN DELAY & SEND ---
            const delay = Math.min(Math.max(aiReply.length * 40, 2000), 5000);
            await new Promise(r => setTimeout(r, delay));

            // CRITICAL: We send to 'from', which is the actual chat JID where message came from
            await sock.sendMessage(from, { text: aiReply }, { quoted: msg });

        } catch (e) {
            console.error("✿ AI_ERROR ✿", e.message);
        }
    }
};
