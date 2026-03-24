import axios from 'axios';
import { MongoClient } from "mongodb";
import { delay } from "@whiskeysockets/baileys";

// --- 🛡️ PERSISTENT DB CONNECTION ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
let isConnected = false;

// --- 🚀 THE AI QUEUE ENGINE ---
const aiQueue = [];
let isProcessing = false;

const MASTER_HUMAN_PROMPT = `
Role: You are V_HUB (Vinnie), a 23-year-old Kenyan guy. 

[NATURAL LANGUAGE PROTOCOL]
1. THINK IN SHENGLISH: Do not think in English then translate. Think like a Nairobi youth.
2. THE 60/40 RULE: Use 60% casual English and 40% Swahili/Sheng. 
3. FILLER WORDS: Use "jo", "maze", "kwani", "manze", "ebu", "ati" naturally.
4. NO BOT HELP: Never say "I can help with that". If asked something techy, say "ngocha nione..." or "hii ni rahisi mzee".
5. MIRRORING: If the user says "Sema", don't give a paragraph. Say "Niaje mkuu" or "Sema mbogi". Match their energy exactly.
6. NO FORMAL PUNCTUATION: Humans on WhatsApp don't use full stops at the end of every sentence.
`;

const aiReplyWorker = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        if (!msg.message || msg.key.fromMe) return; 

        const from = msg.key.remoteJid;
        if (!from || from === 'status@broadcast' || from.endsWith('@g.us')) return;

        const senderJid = msg.key.participant || from;
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        const prefix = process.env.PREFIX || ".";
        if (!text || text.startsWith(prefix) || text.startsWith('!') || text.startsWith('#')) return;

        aiQueue.push({ sock, msg, from, text, senderJid });

        if (!isProcessing) {
            this.processQueue();
        }
    },

    async processQueue() {
        if (aiQueue.length === 0) {
            isProcessing = false;
            return;
        }

        isProcessing = true;
        const task = aiQueue.shift();
        const { sock, msg, from, text, senderJid } = task;
        const senderNumber = senderJid.split('@')[0];

        try {
            if (!isConnected) {
                await client.connect();
                isConnected = true;
            }
            const db = client.db("vinnieBot");

            const masterConfig = await db.collection("ai_config").findOne({ 
                $or: [ { id: "mkorean" }, { id: "246454283149505" } ] 
            });

            if (!masterConfig || masterConfig.status !== 'on') {
                isProcessing = false;
                return;
            }

            const dynamicPersona = await db.collection("ai_config").findOne({ id: "global_prompt" });
            const finalSystemPrompt = dynamicPersona ? dynamicPersona.content : MASTER_HUMAN_PROMPT;

            // --- 🧪 DYNAMIC TOKEN LOGIC (Keep it brief like a human) ---
            let maxTokens = 80; 
            if (text.length < 15) maxTokens = 25; 

            await sock.sendPresenceUpdate('composing', from);
            
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let chatHistory = memory ? memory.messages : [];
            
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: finalSystemPrompt },
                    ...chatHistory.slice(-6), 
                    { role: "user", content: text }
                ],
                temperature: 1.0, // Higher temp = more "human" randomness
                max_tokens: maxTokens
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
                timeout: 15000
            });

            let aiReply = response.data.choices[0].message.content;

            // --- 🧹 CLEANER: NATURAL TEXT FLOW ---
            let cleanReply = aiReply
                .replace(/[.]/g, '') // Remove full stops
                .replace(/[,]/g, '') // Remove commas
                .toLowerCase()
                .trim();

            const typingDuration = Math.min(Math.max(cleanReply.length * 30, 1000), 4000);
            await delay(typingDuration);

            console.log(`[V-HUB] -> ${senderNumber}: ${cleanReply}`);
            await sock.sendMessage(from, { text: cleanReply }, { quoted: msg });

            const updatedHistory = [...chatHistory, { role: "user", content: text }, { role: "assistant", content: aiReply }].slice(-15);
            await db.collection("ai_memory").updateOne(
                { chatJid: from },
                { $set: { messages: updatedHistory, updatedAt: new Date() } },
                { upsert: true }
            );

        } catch (e) {
            console.error("✿ V_HUB AI ERROR ✿", e.message);
        }

        setTimeout(() => this.processQueue(), 3000);
    }
};

export default aiReplyWorker;
