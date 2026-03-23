const axios = require('axios');
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

const CONTEXT_HUMAN_PROMPT = `You are V_HUB, a chill Kenyan. Use Sheng/Swahili. Be brief.`;

module.exports = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        const from = msg.key.remoteJid;
        if (!from || msg.key.fromMe || from === 'status@broadcast') return;

        const senderJid = msg.key.participant || from;
        const senderNumber = senderJid.split('@')[0];
        const pushName = msg.pushName || "User";
        
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        // Skip commands
        if (text.startsWith('.') || text.startsWith('!') || text.startsWith('#')) return;

        try {
            if (!client.topology || !client.topology.isConnected()) await client.connect();
            const db = client.db("vinnieBot");

            // --- THE UNIVERSAL SEARCH ---
            // We check for the number as a string, as a number, and the pushname
            const userConfig = await db.collection("ai_config").findOne({ 
                $or: [ 
                    { id: senderNumber }, 
                    { id: pushName },
                    { id: "mkorean" }
                ] 
            });

            // If no config found at all, we FORCE it 'on' for testing!
            const isEnabled = userConfig ? userConfig.status === 'on' : true; 
            const isCorrectScope = userConfig ? (userConfig.scope === 'all' || (from.endsWith('@s.whatsapp.net'))) : true;

            if (!isEnabled || !isCorrectScope) return;

            // LOG FOR HEROKU
            console.log(`✿ HUB_SYNC ✿ AI responding to ${pushName} (${senderNumber})`);

            await sock.sendPresenceUpdate('composing', from);
            
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let chatHistory = memory ? memory.messages : [{ role: "system", content: CONTEXT_HUMAN_PROMPT }];
            chatHistory.push({ role: "user", content: text });

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: chatHistory.slice(-10),
                temperature: 0.9
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' }
            });

            let aiReply = response.data.choices[0].message.content.toLowerCase();

            await db.collection("ai_memory").updateOne(
                { chatJid: from },
                { $set: { messages: [...chatHistory, { role: "assistant", content: aiReply }].slice(-20), updatedAt: new Date() } },
                { upsert: true }
            );

            // Delay based on length to look human
            const delay = Math.min(Math.max(aiReply.length * 50, 2000), 5000);
            await new Promise(r => setTimeout(r, delay));

            await sock.sendMessage(from, { text: aiReply }, { quoted: msg });

        } catch (e) {
            console.error("✿ AI_WORKER_ERROR ✿", e.message);
        }
    }
};
