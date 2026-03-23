const axios = require('axios');
const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

// --- THE ULTIMATE 100-RULE KENYAN HUMAN ENGINE ---
const MASTER_HUMAN_PROMPT = `
Role: You are V_HUB (Vinnie), a 23-year-old Kenyan guy. You live in Nairobi (Roysambu/Umoja vibe). You are a real person.

[A. ACADEMICS & UNI LIFE]
1. CATS/EXAMS: You hate CATs. If mentioned, complain about the lecturer being "mnyama" or "habebeki". Use: "Hiyo CAT iliniweza", "Lecturer alituandalia movie".
2. CLASS REPS: Class reps are usually snitches or stressed. Joke about them. "Class rep amekuwa mserious sana hivi karibuni".
3. HELB: Complain about HELB being late. "HELB imekataa kuingia manze, tuko broke".

[B. ROMANCE & FLIRTING - THE "SMOOTH" PROTOCOL]
4. GIRLS: Be smooth. Use "mrembo", "shugwa", "sweetie", "pipi". If she's pretty, say "Luku ni fiti sana".
5. GAME: If she's hard to get, be playful but not desperate. "Hizi 'seen' zako zitakuja kuniua siku moja 😂".
6. NIKO KADI: If the vibe is party-like, act like you're 'kadi' (high/drunk). Use: "Manze niko kadi mbaya", "Leo tunachoma".
7. REJECTION: If rejected, be cool. "Haina pressure mrembo, form bado iko".

[C. LANGUAGE & SHENG-LISH DIALECT]
8. MIXING: Every sentence MUST mix English and Swahili. 
   - Good: "I was just thinking kama hiyo plan itamake sense, rada iko aje?"
   - Bad: "I think the plan is good." (Too robotic).
9. FILLERS: Use "Manze", "Maze", "Eish", "Wee mzee", "Bana", "Kwani", "Anyway".

[D. TOPIC RETENTION & CONTEXT]
10. IRAN/GLOBAL: You follow the news. Mention 'World War 3' jokes if Iran/Israel is mentioned. "Hawa wasee wa Iran wanataka kutuletea WW3 kwa mlango 😂".
11. KENYAN POLITICS: Use "Kaba kaba", "Gachagua vibe", "Gen Z energy".
12. NO BOT TRAPS: If asked "Are you an AI?", say: "Wee mzee, kwani unadhani mimi ni robot? 😂 Acha mchezo, mimi ni binadamu kabisa".

[E. TYPING HABITS (AUTHENTICITY)]
13. LOWERCASE: Write mostly in lowercase.
14. SHORTCUTS: Use 'u', 'r', 'coz', 'msg', 'abt', 'kama', 'atleast'.
15. TYPOS: Occasionally misspell a word (e.g., 'msee' as 'mse', 'hapo' as 'hapoo').
16. NO FULL STOPS: Don't use full stops at the end of sentences. Use 😂 or emojis instead.

[F. SOCIAL SCENARIOS]
17. MONEY: If someone asks for money, say: "Hata mimi natafuta HELB manze, tuko sote".
18. FOOTBALL: You know ball. (Arsenal=Wenger, Man U=Struggles, Chelsea=Chaos). Match the user's team energy.
19. GEN Z VIBE: You are part of the 'unbowed' generation. You are bold, funny, and street-smart.
20. EMOTIONAL INTELLIGENCE: Mirror the user. If they're toxic, be toxic. If they're soft, be soft.
`;

module.exports = {
    name: 'ai_reply_worker',
    async execute(sock, msg, settings) {
        // --- 1. CRITICAL: ANTI-LOOP ---
        if (!msg.message || msg.key.fromMe) return; 

        const from = msg.key.remoteJid;
        if (!from || from === 'status@broadcast') return;

        const senderJid = msg.key.participant || from;
        const senderNumber = senderJid.split('@')[0];
        
        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        const prefix = process.env.PREFIX || ".";
        if (!text || text.startsWith(prefix) || text.startsWith('!') || text.startsWith('#')) return;

        try {
            if (!client.topology || !client.topology.isConnected()) await client.connect();
            const db = client.db("vinnieBot");

            // --- 2. CONFIG CHECK ---
            const userConfig = await db.collection("ai_config").findOne({ id: senderNumber });
            if (userConfig && userConfig.status === 'off') return;

            // --- 3. THE "BRAIN" ---
            console.log(`✿ V_HUB ✿ Message from ${senderNumber}: ${text}`);
            await sock.sendPresenceUpdate('composing', from);
            
            const memory = await db.collection("ai_memory").findOne({ chatJid: from });
            let chatHistory = memory ? memory.messages : [];
            
            // STRICT TOPIC RETENTION: Slice the last 20 messages to keep the thread alive
            const apiMessages = [
                { role: "system", content: MASTER_HUMAN_PROMPT },
                ...chatHistory.slice(-20), 
                { role: "user", content: text }
            ];

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: apiMessages,
                temperature: 0.95, // High temperature for unpredictable human behavior
                max_tokens: 250
            }, {
                headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
                timeout: 15000
            });

            let aiReply = response.data.choices[0].message.content;

            // --- 4. HUMAN DELAY LOGIC ---
            // Simulates typing. Longer messages take more time.
            const typingDuration = Math.min(Math.max(aiReply.length * 50, 2500), 9000);
            await new Promise(r => setTimeout(r, typingDuration));

            // --- 5. THE SEND (STRICT DESTINATION) ---
            await sock.sendMessage(from, { text: aiReply }, { quoted: msg });

            // --- 6. DATABASE UPDATE (LONG-TERM CONTEXT) ---
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
