const { MongoClient } = require("mongodb");
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

module.exports = async (sock, msg) => {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return; // Only track groups

    const sender = msg.key.participant || msg.key.remoteJid;
    const timestamp = Date.now();

    try {
        await client.connect();
        const db = client.db("vinnieBot");
        const collection = db.collection("group_activity");

        // Update the user's last seen time for THIS specific group
        await collection.updateOne(
            { groupId: from, userId: sender },
            { $set: { lastSeen: timestamp, name: msg.pushName || "Unknown" } },
            { upsert: true }
        );
    } catch (e) {
        console.error("Activity Tracker Error:", e);
    }
};