import { MongoClient } from "mongodb";

// --- 🛡️ PERSISTENT DATABASE CONNECTION ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
let isConnected = false;

/**
 * V-HUB_WORKER: MESSAGE_COUNTER
 * Tracks message counts for Group Leaderboards and Activity Stats.
 * Logic: Increments 'count' by 1 per message and updates 'lastActive'.
 */
const messageCounter = {
    name: "message_counter",
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        
        // 1. Logic Guard: Only track activity in Groups
        if (!from || !from.endsWith('@g.us')) return; 

        const sender = msg.key.participant || from;

        try {
            // 2. Optimized Connection (Prevents MongoDB 'Too Many Connections' Error)
            if (!isConnected) {
                await client.connect();
                isConnected = true;
            }

            const db = client.db("vinnieBot");
            const collection = db.collection("message_counts");

            // --- 🚀 THE ENGAGEMENT SYNC ---
            // Preserving your exact upsert and increment logic
            await collection.updateOne(
                { groupId: from, userId: sender },
                { 
                    $inc: { count: 1 }, 
                    $set: { 
                        lastActive: Date.now(),
                        name: msg.pushName || "Unknown" 
                    } 
                },
                { upsert: true }
            );

        } catch (e) {
            // Silent fail to ensure message processing speed isn't affected
        }
    }
};

export default messageCounter;
