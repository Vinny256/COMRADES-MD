import fs from 'fs-extra';
import { MongoClient } from "mongodb";

// --- 🛡️ PERSISTENT DATABASE CONNECTION ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
const settingsFile = './settings.json';
let isConnected = false;

/**
 * V-HUB_WORKER: AUTO_PROMO_ENGINE
 * Cycles through all groups every hour to broadcast the bot's status.
 * Logic: Checks 'autopromo' toggle in settings and tracks history in MongoDB.
 */
const promoWorker = {
    name: "autopromo_worker",
    async initPromo(sock) {
        // Run check every hour (3600000 ms)
        setInterval(async () => {
            try {
                // 1. Logic Guard: Check if the file exists and if promo is enabled
                if (!fs.existsSync(settingsFile)) return;
                const settings = fs.readJsonSync(settingsFile);
                if (!settings.autopromo) return;

                // 2. Ensure Database Handshake
                if (!isConnected) {
                    await client.connect();
                    isConnected = true;
                }
                const db = client.db("vinnieBot");
                const broadcastCol = db.collection("broadcast_tracker");

                // 3. Fetch Group Data
                const groupsList = await sock.groupFetchAllParticipating();
                const groups = Object.keys(groupsList);
                if (groups.length === 0) return;

                // 4. Cycle Tracking: Find groups not yet reached in this cycle
                const tracked = await broadcastCol.find({}).toArray();
                const messagedJids = tracked.map(t => t.jid);
                const remainingGroups = groups.filter(jid => !messagedJids.includes(jid));

                // 5. Reset Cycle: If all groups are messaged, clear tracker for next round
                if (remainingGroups.length === 0) {
                    await broadcastCol.deleteMany({});
                    console.log(`┌─『 ᴠ-ʜᴜʙ_ᴘʀᴏᴍᴏ 』\n│ 🔄 *ᴄʏᴄʟᴇ_ʀᴇsᴇᴛ*\n│ ⚙ ʟᴏɢ: sᴛᴀʀᴛɪɴɢ_ɴᴇᴡ_ʀᴏᴜɴᴅ\n└────────────────────────┈`);
                    return; 
                }

                // 6. Targeting: Pick one random remaining group
                const targetJid = remainingGroups[Math.floor(Math.random() * remainingGroups.length)];
                const prefix = process.env.PREFIX || ".";

                // 7. THE VHUB PROMO MESSAGE (PRESERVED)
                const promoMsg = `┌────────────────────────┈\n│      *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* \n└────────────────────────┈\n\n┌─『 sʏsᴛᴇᴍ_sᴛᴀᴛᴜs 』\n│ 🤖 *sᴛᴀᴛᴜs:* ᴀᴄᴛɪᴠᴇ\n│ 🚀 *ᴘʀᴇғɪx:* ${prefix}\n│ 📑 *ɪɴғᴏ:* ᴛʏᴘᴇ *${prefix}menu*\n│ 🛡️ *ᴘᴏᴡᴇʀ:* ɴᴜᴄʟᴇᴀʀ sʜɪᴇʟᴅ ᴀᴄᴛɪᴠᴇ\n└────────────────────────┈\n\n_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠ-ʜᴜʙ_`;

                await sock.sendMessage(targetJid, { text: promoMsg });
                
                // 8. Mark as messaged
                await broadcastCol.insertOne({ jid: targetJid, timestamp: new Date() });
                
                console.log(`┌─『 ᴠ-ʜᴜʙ_ᴘʀᴏᴍᴏ 』\n│ 📡 ʙʀᴏᴀᴅᴄᴀsᴛ: sᴇɴᴛ\n│ ✅ ᴛᴀʀɢᴇᴛ: ${targetJid}\n└────────────────────────┈`);

            } catch (e) {
                console.error("🛰️ [PROMO_WORKER_ERR]:", e.message);
            }
        }, 3600000); 
    },

    // Standard execute for the index.js worker loader
    async execute(sock) {
        this.initPromo(sock);
    }
};

export default promoWorker;
