const { MongoClient } = require("mongodb");
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

module.exports = async (sock, msg) => {
    const from = msg.key.remoteJid;
    if (!from.endsWith('@g.us')) return; // Only track groups

    const sender = msg.key.participant || msg.key.remoteJid;

    try {
        const db = client.db("vinnieBot");
        const collection = db.collection("message_counts");

        // Increment the count for this user in this group
        await collection.updateOne(
            { groupId: from, userId: sender },
            { $inc: { count: 1 }, $set: { lastActive: Date.now() } },
            { upsert: true }
        );
    } catch (e) {
        // Silent fail to prevent slowing down the bot
    }
};