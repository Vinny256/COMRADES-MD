const axios = require('axios');
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

module.exports = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        const from = msg.key.remoteJid;
        const sender = (msg.key.participant || from).split('@')[0];
        const isGroup = from.endsWith('@g.us');
        
        // 1. Basic Filters
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        if (!text || msg.key.fromMe || from === 'status@broadcast' || text.startsWith(process.env.PREFIX || ".")) return;

        try {
            const db = client.db("vinnieBot");
            const userConfig = await db.collection("ai_config").findOne({ id: sender }) || { status: 'off', scope: 'inbox' };

            // 2. Logic for "Inbox" vs "All"
            if (userConfig.status === 'off') return;
            if (userConfig.scope === 'inbox' && isGroup) return;

            // 3. Human Simulation (Typing...)
            await sock.sendPresenceUpdate('composing', from);
            
            // 4. Memory & AI Call
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let messages = memory ? memory.messages : [
                { role: "system", content: "You are V_HUB, a chill Kenyan. Use Sheng/Swahili. No formal AI talk. Keep it short & witty. 🇰🇪" }
            ];
            messages.push({ role: "user", content: text });

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: messages.slice(-10),
                temperature: 0.85 // High creativity for casual vibe
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
            });

            const replyText = response.data.choices[0].message.content;

            // 5. Save Memory (Auto-deletes via TTL index)
            messages.push({ role: "assistant", content: replyText });
            await db.collection("ai_memory").updateOne(
                { chatJid: from },
                { $set: { messages: messages.slice(-15), updatedAt: new Date() } },
                { upsert: true }
            );

            // Random delay to look human (2-4 seconds)
            await new Promise(r => setTimeout(r, Math.random() * 2000 + 2000));
            await sock.sendMessage(from, { text: replyText }, { quoted: msg });

        } catch (e) { console.log("AI Worker Error"); }
    }
};
