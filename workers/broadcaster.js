import fs from 'fs-extra';
import { MongoClient } from "mongodb";

// --- 🛡️ PERSISTENT DATABASE CONNECTION ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
let isConnected = false;

/**
 * V-HUB_WORKER: PROMO_BROADCASTER
 * Cycles through all participating groups every hour to send a promo message.
 * Logic: Tracks messaged groups in MongoDB to prevent duplicate spam within a cycle.
 */
const promoWorker = {
    name: "promo_worker",
    async startAutoPromotion(sock) {
        // Run check every hour (3600000 ms)
        setInterval(async () => {
            try {
                // 1. Ensure DB Handshake
                if (!isConnected) {
                    await client.connect();
                    isConnected = true;
                }
                const db = client.db("vinnieBot");
                const broadcastCol = db.collection("broadcast_tracker");

                // 2. Fetch all groups the bot is currently in
                const participatingGroups = await sock.groupFetchAllParticipating();
                const groups = Object.keys(participatingGroups);
                
                if (groups.length === 0) return;

                // 3. Identification: Find groups we haven't messaged in this cycle
                const tracked = await broadcastCol.find({}).toArray();
                const messagedJids = tracked.map(t => t.jid);
                const remainingGroups = groups.filter(jid => !messagedJids.includes(jid));

                // 4. Reset cycle if all groups have been reached
                if (remainingGroups.length === 0) {
                    await broadcastCol.deleteMany({});
                    console.log(`┌─『 ᴠ-ʜᴜʙ_ʙʀᴏᴀᴅᴄᴀsᴛ 』\n│ 🔄 *ᴄʏᴄʟᴇ_ʀᴇsᴇᴛ*\n│ ⚙ ʟᴏɢ: ᴀʟʟ_ɢʀᴏᴜᴘs_ʀᴇᴀᴄʜᴇᴅ\n└────────────────────────┈`);
                    return; 
                }

                // 5. Targeting: Pick one random group from the remaining list
                const targetJid = remainingGroups[Math.floor(Math.random() * remainingGroups.length)];
                const groupName = participatingGroups[targetJid]?.subject || "ᴛʜɪs_ɢʀᴏᴜᴘ";

                // 6. THE VHUB PROMOTION MESSAGE (PRESERVED)
                const prefix = process.env.PREFIX || ".";
                const promoMsg = `┌────────────────────────┈\n│      *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* \n└────────────────────────┈\n\n┌─『 sʏsᴛᴇᴍ_sᴛᴀᴛᴜs 』\n│ 🤖 *sᴛᴀᴛᴜs:* ᴀᴄᴛɪᴠᴇ & ᴏɴʟɪɴᴇ\n│ 🚀 *ᴘʀᴇғɪx:* ${prefix}\n│ 📑 *ᴄᴏᴍᴍᴀɴᴅs:* 𝟻𝟶+ ᴘʟᴜs\n│ 🛠️ *ғᴇᴀᴛᴜʀᴇs:* ᴀɴᴛɪ-ʙᴏᴛ, ɢᴀᴍᴇs,\n│    ᴀɴᴛɪᴅᴇʟᴇᴛᴇ, & ᴇᴄᴏɴᴏᴍʏ.\n└────────────────────────┈\n\n💡 *ᴛɪᴘ:* ᴛʏᴘᴇ *${prefix}menu* ᴛᴏ sᴇᴇ\nᴇᴠᴇʀʏᴛʜɪɴɢ ɪ ᴄᴀɴ ᴅᴏ!\n\n_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠ-ʜᴜʙ_`;

                await sock.sendMessage(targetJid, { text: promoMsg });
                
                // 7. Sync: Mark as messaged in the database
                await broadcastCol.insertOne({ jid: targetJid, timestamp: new Date() });
                
                console.log(`┌─『 ᴠ-ʜᴜʙ_ʙʀᴏᴀᴅᴄᴀsᴛ 』\n│ 📡 ᴘʀᴏᴍᴏ_sᴇɴᴛ: ${groupName}\n│ ✅ ᴛᴀʀɢᴇᴛ: ${targetJid}\n└────────────────────────┈`);

            } catch (e) {
                console.error("🛰️ [BROADCASTER_ERR]:", e.message);
            }
        }, 3600000); 
    },

    // Standard execute for the index.js loader
    async execute(sock) {
        this.startAutoPromotion(sock);
    }
};

export default promoWorker;
