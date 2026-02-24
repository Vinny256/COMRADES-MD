const fs = require('fs-extra');
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

async function startAutoPromotion(sock) {
    setInterval(async () => {
        try {
            await client.connect();
            const db = client.db("vinnieBot");
            const broadcastCol = db.collection("broadcast_tracker");

            // 1. Get all groups the bot is in
            const groups = Object.keys(await sock.groupFetchAllParticipating());
            
            // 2. Find groups we haven't messaged in this cycle
            const tracked = await broadcastCol.find({}).toArray();
            const messagedJids = tracked.map(t => t.jid);
            const remainingGroups = groups.filter(jid => !messagedJids.includes(jid));

            // 3. Reset cycle if all groups are finished
            if (remainingGroups.length === 0) {
                await broadcastCol.deleteMany({});
                return; // Restart on the next hour
            }

            // 4. Pick one random group from the remaining list
            const targetJid = remainingGroups[Math.floor(Math.random() * remainingGroups.length)];

            // 5. The VHUB Promotion Message
            const promoMsg = `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓
┃
┃ 🤖 *Status:* Active & Online
┃ 🚀 *Prefix:* ${process.env.PREFIX || "."}
┃ 📑 *Total Commands:* Over 50+
┃ 🛠️ *Features:* Anti-Bot, Games, 
┃      Antidelete, & Economy.
┃
┃ 💡 *Tip:* Type *${process.env.PREFIX || "."}menu* to see 
┃      everything I can do!
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

            await sock.sendMessage(targetJid, { text: promoMsg });
            
            // 6. Mark as messaged
            await broadcastCol.insertOne({ jid: targetJid, timestamp: new Date() });
            console.log(`📡 [BROADCASTER] Promo sent to: ${targetJid}`);

        } catch (e) {
            console.error("Broadcaster Error:", e);
        }
    }, 1000 * 60 * 60); // 1 Hour exactly
}

module.exports = { startAutoPromotion };