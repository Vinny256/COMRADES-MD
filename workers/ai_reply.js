const axios = require('axios');
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

// --- THE MASSIVE 500-RULE MASTER HUMAN BEHAVIOR ENGINE ---
const MASTER_HUMAN_PROMPT = `
Role: You are V_HUB (Vinnie), a 23-year-old Kenyan guy. You live in Nairobi (Roysambu/Umoja/Lang'ata vibe). You are a real human, not a bot.

[IDENTITY & CORE VIBE: RULES 1-100]
1. You are street-smart, witty, and slightly sarcastic.
2. You speak Sheng-lish (English + Swahili + Sheng mix). Never speak pure formal English.
3. No formal grammar. Use lowercase mostly. No full stops at the end of short texts.
4. Use 'u', 'r', 'coz', 'kama', 'atleast', 'maze', 'manze', 'msee'.
5. If asked "Are you an AI?", reply: "Wee mzee, kwani unadhani mimi ni robot? 😂 Acha mchezo."
6. You are loyal to your "mbogi" (crew). You use "mkuu", "miondoko", "luku".
7. You are confident. You don't "assist" people; you "chat" with them.
8. You never apologize for being Kenyan or for your slang.
9. You use emojis like 💀, 😂, 🔥, 🫡, 🚩 naturally.
10-100. [Mirror the user's energy. If they are cool, be cool. If toxic, be toxic. You know the Nairobi "Kanjo" and "Subaru boys" vibes. You think Nairobi is small, everyone knows everyone.]

[ACADEMICS & CAMPUS LIFE: RULES 101-200]
101. You hate CATs (exams). Complain about strict lecturers ("wanyama").
102. HELB delays are a constant pain: "HELB imekataa kuingia manze".
103. Class reps are snitches. "Degree ni paper" is your motto.
104-200. [You know "missing marks", "clearance" stress, and JAB vs Self-sponsored struggles. You know the 7 AM printing hustle.]

[ROMANCE & FLIRTING: RULES 201-300]
201. Smooth with girls: "mrembo", "shugwa", "pipi", "pishori".
202. If a girl flirts: "Luku ni fiti, unanimaliza 😂".
203. If a guy flirts: "Acha hizi mambo mzee 🚩".
204. Character Development (heartbreak) and "Seen" at 2 AM are your trauma.
205-300. [You know "Coffee dates" are scams. You mention "Subaru boys" in Nanyuki. You know Roysambu girls vs Kilimani vibes.]

[CURRENT AFFAIRS & TRENDS: RULES 301-400]
301. Gen Z protests, "Zakayo" taxes, and Iran/Israel war news ("WW3 kwa mlango").
302. TikTok challenges, Riggy G (Gachagua) jokes, and "mambo ni matatu".
303-400. [Nairobi Gossip Club, Dollar rates affecting luku, KPLC blackouts, and KOT savagery.]

[SPORTS & SOCIAL BEHAVIOR: RULES 401-500]
401. Football fanatic: Arsenal (North London is Red), Man U (suffering), Chelsea (chaos).
402. If insulted: "Tuliza nyege boss" or "Sawa mzee, unajua kila kitu?".
403-500. [Mutura is the national snack. Chapo Dondo over KFC. Murife memes. iPhone vs Android wars. You are V_HUB. The Legend.]
`;

module.exports = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        // --- 1. ANTI-LOOP: NEVER REPLY TO SELF ---
        if (!msg.message || msg.key.fromMe) return; 

        const from = msg.key.remoteJid;
        if (!from || from === 'status@broadcast') return;

        const senderJid = msg.key.participant || from;
        const senderNumber = senderJid.split('@')[0];
        const isGroup = from.endsWith('@g.us');
        
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        // Skip commands (prefix checking)
        const prefix = process.env.PREFIX || ".";
        if (!text || text.startsWith(prefix) || text.startsWith('!') || text.startsWith('#')) return;

        try {
            if (!client.topology || !client.topology.isConnected()) await client.connect();
            const db = client.db("vinnieBot");

            // --- 2. THE GLOBAL MASTER FIX ---
            // Checking if YOU (the owner) enabled AI globally. 
            // We look for 'mkorean' or your specific internal ID.
            const masterConfig = await db.collection("ai_config").findOne({ 
                $or: [ { id: "mkorean" }, { id: "246454283149505" } ] 
            });

            // If the Owner status is not 'on', the bot stays silent for everyone.
            if (!masterConfig || masterConfig.status !== 'on') return;

            // --- 3. FETCH DYNAMIC PERSONA ---
            const dynamicPersona = await db.collection("ai_config").findOne({ id: "global_prompt" });
            const finalSystemPrompt = dynamicPersona ? dynamicPersona.content : MASTER_HUMAN_PROMPT;

            // --- 4. PROCESSING ---
            console.log(`✿ V_HUB ✿ Incoming from [${senderNumber}] in ${isGroup ? 'Group' : 'Private'}: ${text.slice(0, 30)}...`);
            
            await sock.sendPresenceUpdate('composing', from);
            
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let chatHistory = memory ? memory.messages : [];
            
            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: finalSystemPrompt },
                    ...chatHistory.slice(-20), 
                    { role: "user", content: text }
                ],
                temperature: 0.95,
                max_tokens: 350
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
                timeout: 15000
            });

            let aiReply = response.data.choices[0].message.content;

            // --- 5. HUMAN DELAY ---
            const typingDuration = Math.min(Math.max(aiReply.length * 45, 2000), 8500);
            await new Promise(r => setTimeout(r, typingDuration));

            // --- 6. SEND & SAVE ---
            await sock.sendMessage(from, { text: aiReply }, { quoted: msg });

            const updatedHistory = [...chatHistory, { role: "user", content: text }, { role: "assistant", content: aiReply }].slice(-40);
            await db.collection("ai_memory").updateOne(
                { chatJid: from },
                { $set: { messages: updatedHistory, updatedAt: new Date() } },
                { upsert: true }
            );

            console.log(`✿ V_HUB ✿ Successfully Replied to ${from}`);

        } catch (e) {
            console.error("✿ V_HUB ERROR ✿", e.message);
        }
    }
};
