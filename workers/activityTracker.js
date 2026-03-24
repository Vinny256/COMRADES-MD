import { MongoClient } from "mongodb";

// --- 🛡️ PERSISTENT DATABASE CONNECTION ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
let isConnected = false;

/**
 * V-HUB_WORKER: ACTIVITY_TRACKER
 * Tracks "Last Seen" data for group members in Embu & beyond.
 */
const activityTracker = {
    name: "activity_tracker",
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        
        // 1. Logic Check: Only track groups
        if (!from || !from.endsWith('@g.us')) return; 

        const sender = msg.key.participant || from;
        const timestamp = Date.now();

        try {
            // 2. Optimized Connection (Only connects once)
            if (!isConnected) {
                await client.connect();
                isConnected = true;
            }

            const db = client.db("vinnieBot");
            const collection = db.collection("group_activity");

            // 3. Update the user's last seen time for THIS specific group
            // Preserving your exact upsert logic
            await collection.updateOne(
                { groupId: from, userId: sender },
                { 
                    $set: { 
                        lastSeen: timestamp, 
                        name: msg.pushName || "Unknown",
                        lastMessage: new Date().toISOString() // Added for better cloud logs
                    } 
                },
                { upsert: true }
            );

        } catch (e) {
            // Silent error handling to keep the bot running during DB lag
            console.error("🛰️ [TRACKER_ERR]:", e.message);
        }
    }
};

export default activityTracker;
