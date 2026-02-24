const fs = require('fs-extra');
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);
const settingsFile = './settings.json';

async function initPromo(sock) {
    // Run the check every hour
    setInterval(async () => {
        const settings = fs.readJsonSync(settingsFile);
        
        // ONLY run if the value is TRUE
        if (!settings.autopromo) return;

        try {
            await client.connect();
            const db = client.db("vinnieBot");
            const broadcastCol = db.collection("broadcast_tracker");

            const groupsList = await sock.groupFetchAllParticipating();
            const groups = Object.keys(groupsList);
            
            const tracked = await broadcastCol.find({}).toArray();
            const messagedJids = tracked.map(t => t.jid);
            const remainingGroups = groups.filter(jid => !messagedJids.includes(jid));

            if (remainingGroups.length === 0) {
                await broadcastCol.deleteMany({});
                return; 
            }

            const targetJid = remainingGroups[Math.floor(Math.random() * remainingGroups.length)];
            const prefix = process.env.PREFIX || ".";

            const promoMsg = `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ 🤖 *Status:* Active\n┃ 🚀 *Prefix:* ${prefix}\n┃ 📑 *Info:* Type *${prefix}menu*\n┃ 🛡️ *Power:* Nuclear Shield Active\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

            await sock.sendMessage(targetJid, { text: promoMsg });
            await broadcastCol.insertOne({ jid: targetJid, timestamp: new Date() });

        } catch (e) { console.error("Promo Worker Error:", e); }
    }, 1000 * 60 * 60); 
}

module.exports = { initPromo };