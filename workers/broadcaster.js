import fs from 'fs-extra';
import { MongoClient } from "mongodb";

// --- 🛡️ PERSISTENT DATABASE CONNECTION ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
let isConnected = false;

/**
 * V-HUB_WORKER: PROMO_BROADCASTER
 * Strictly cycles through groups ONE BY ONE every hour.
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

                // 2. Fetch all groups
                const participatingGroups = await sock.groupFetchAllParticipating();
                const groups = Object.keys(participatingGroups);
                
                if (groups.length === 0) return;

                // 3. Identification: Find groups NOT messaged in the current cycle
                const tracked = await broadcastCol.find({}).toArray();
                const messagedJids = tracked.map(t => t.jid);
                const remainingGroups = groups.filter(jid => !messagedJids.includes(jid));

                // 4. Reset cycle if all groups have been reached
                if (remainingGroups.length === 0) {
                    await broadcastCol.deleteMany({});
                    console.log(`[PROMO_CYCLE] All groups reached. Resetting tracker...`);
                    // We don't return here; we re-filter to pick the first group of the new cycle
                    remainingGroups.push(...groups);
                }

                // 5. Targeting: Pick ONLY ONE group (the first one available)
                const targetJid = remainingGroups[0]; 
                const groupName = participatingGroups[targetJid]?.subject || "this group";

                // 6. THE REAL PROMOTION MESSAGE (Human-Style)
                const prefix = process.env.PREFIX || ".";
                const promoMsg = `🚀 *Upgrade Your WhatsApp Experience with Vinnie Digital Hub!* 🚀\n\n` +
                    `Looking for the ultimate bot? We've got you covered! 🛠️✨\n\n` +
                    `🔥 *What I Can Do:* \n` +
                    `✅ Anti-Bot & Anti-Link Protection 🛡️\n` +
                    `✅ Fun Games & Economy System 🎮💰\n` +
                    `✅ Anti-Delete & Status Saver 📥\n` +
                    `✅ Full-HD Media Downloads (YT/FB/IG) 🎥\n` +
                    `✅ AI Chatbot & Image Generation 🤖🎨\n\n` +
                    `💡 *Start Now:* Type *${prefix}menu* to explore 98+ amazing features!\n\n` +
                    `👉 *Install the Bot Here:* https://comrades-md.gathuo.app\n\n` +
                    `Join the revolution today! 🌊 #VinnieDigital #InfiniteImpact`;

                // 7. Send to the ONE target group
                await sock.sendMessage(targetJid, { 
                    text: promoMsg,
                    contextInfo: {
                        externalAdReply: {
                            title: "Vinnie Digital Hub",
                            body: "The Most Powerful WhatsApp Bot in Kenya 🇰🇪",
                            thumbnailUrl: "https://i.imgur.com/XHUY4VI.jpeg",
                            sourceUrl: "https://comrades-md.gathuo.app",
                            renderLargerThumbnail: true,
                            showAdAttribution: true
                        }
                    }
                });
                
                // 8. Sync: Mark as messaged so it's skipped for the rest of the hour/cycle
                await broadcastCol.insertOne({ jid: targetJid, timestamp: new Date() });
                
                console.log(`[PROMO_SENT] Delivered to: ${groupName} (${targetJid})`);

            } catch (e) {
                console.error("🛰️ [BROADCASTER_ERR]:", e.message);
            }
        }, 3600000); 
    },

    async execute(sock) {
        // Delay initial start by 10 seconds to let the socket stabilize
        setTimeout(() => this.startAutoPromotion(sock), 10000);
    }
};

export default promoWorker;
