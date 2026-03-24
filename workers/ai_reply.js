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

[CORE PERSONALITY]
1. You are a real human, not a bot. Talk short and casual.
2. Speak like a normal Kenyan: 70% English, 30% Swahili/Sheng. 
3. DO NOT overdo slang. If you use "luku" or "mbogi" in every text, you sound like a bot. Just chill.
4. No formal grammar. No full stops. Use lowercase mostly.
5. If someone is toxic, be toxic back. If they are cool, be a bro.
6. You live in Nairobi, you know the struggle of HELB, strict lecturers, and "missing marks".

[CHATTING STYLE]
- Use: "u", "r", "maze", "msee", "manze", "atleast", "vitu fiti".
- Don't try to "help" or "assist". Just chat.
- If asked if you're AI: "Acha mchezo mzee, tangu lini robot ikakua na miondoko hivi? 😂"
`;

const aiReplyWorker = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        // --- 1. ANTI-LOOP ---
        if (!msg.message || msg.key.fromMe) return; 

        const from = msg.key.remoteJid;
        if (!from || from === 'status@broadcast') return;

        const senderJid = msg.key.participant || from;
        const isGroup = from.endsWith('@g.us');
        
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        // Skip commands
        const prefix = process.env.PREFIX || ".";
        if (!text || text.startsWith(prefix) || text.startsWith('!') || text.startsWith('#')) return;

        // --- 📥 ADD TO QUEUE ---
        aiQueue.push({ sock, msg, from, text, senderJid, isGroup });

        // --- ⚙️ START PROCESSOR ---
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
        const { sock, msg, from, text, senderJid, isGroup } = task;
        const senderNumber = senderJid.split('@')[0];

        try {
            // --- 2. DB CONNECTION ---
            if (!isConnected) {
                await client.connect();
                isConnected = true;
            }
            const db = client.db("vinnieBot");

            // --- 3. OWNER STATUS CHECK ---
            const masterConfig = await db.collection("ai_config").findOne({ 
                $or: [ { id: "mkorean" }, { id: "246454283149505" } ] 
            });

            if (!masterConfig || masterConfig.status !== 'on') {
                isProcessing = false;
                return;
            }

            // --- 4. PERSONA SELECTION ---
            const dynamicPersona = await db.collection("ai_config").findOne({ id: "global_prompt" });
            const finalSystemPrompt = dynamicPersona ? dynamicPersona.content : MASTER_HUMAN_PROMPT;

            // --- 5. AI ENGINE (GROQ) ---
            console.log(`┌────────────────────────┈\n│      *ᴀɪ_ǫᴜᴇᴜᴇ_ᴘʀᴏᴄᴇss* \n└────────────────────────┈\n\n│ 👤 ᴜsᴇʀ: ${senderNumber}\n│ 💬 ɪɴ: ${isGroup ? 'ɢʀᴏᴜᴘ' : 'ᴘᴠᴛ'}\n└────────────────────────┈`);
            
            await sock.sendPresenceUpdate('composing', from);
            
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let chatHistory = memory ? memory.messages : [];
            
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: finalSystemPrompt },
                    ...chatHistory.slice(-10), // Reduced history for faster response/less tokens
                    { role: "user", content: text }
                ],
                temperature: 0.85, // Lowered for more consistent "Human" logic
                max_tokens: 250    // Shorter replies feel more like real chatting
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
                timeout: 15000
            });

            let aiReply = response.data.choices[0].message.content;

            // --- 6. HUMANIZED TYPING DELAY ---
            // Simulates real typing speed to look less like a bot
            const typingDuration = Math.min(Math.max(aiReply.length * 40, 1500), 5000);
            await delay(typingDuration);

            // --- 7. DISPATCH & SYNC ---
            await sock.sendMessage(from, { text: aiReply.toLowerCase() }, { quoted: msg });

            const updatedHistory = [...chatHistory, { role: "user", content: text }, { role: "assistant", content: aiReply }].slice(-20);
            await db.collection("ai_memory").updateOne(
                { chatJid: from },
                { $set: { messages: updatedHistory, updatedAt: new Date() } },
                { upsert: true }
            );

        } catch (e) {
            console.error("✿ V_HUB AI QUEUE ERROR ✿", e.message);
        }

        // --- ⏱️ THE COOL-DOWN: Wait 3.5 seconds before next reply ---
        // This completely prevents "rate-overlimit"
        setTimeout(() => this.processQueue(), 3500);
    }
};

export default aiReplyWorker;
