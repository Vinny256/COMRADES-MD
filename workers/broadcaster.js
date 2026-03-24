import fs from 'fs-extra';
import { MongoClient } from "mongodb";

// --- 🛡️ PERSISTENT DATABASE CONNECTION ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
let isConnected = false;

// 🛑 GLOBAL SAFETY LOCK: Prevents multiple intervals from starting
if (!global.promoRunning) global.promoRunning = false;

const promoWorker = {
    name: "promo_worker",
    async startAutoPromotion(sock) {
        // If already running, don't start another clock!
        if (global.promoRunning) return;
        global.promoRunning = true;

        console.log("🚀 [PROMO_SYSTEM]: Engine started. Cycling every 1 hour.");

        setInterval(async () => {
            try {
                if (!isConnected) {
                    await client.connect();
                    isConnected = true;
                }
                const db = client.db("vinnieBot");
                const broadcastCol = db.collection("broadcast_tracker");

                const participatingGroups = await sock.groupFetchAllParticipating();
                const groups = Object.keys(participatingGroups);
                
                if (groups.length === 0) return;

                const tracked = await broadcastCol.find({}).toArray();
                const messagedJids = tracked.map(t => t.jid);
                const remainingGroups = groups.filter(jid => !messagedJids.includes(jid));

                if (remainingGroups.length === 0) {
                    await broadcastCol.deleteMany({});
                    console.log(`[PROMO_CYCLE] Cycle complete. Resetting...`);
                    remainingGroups.push(...groups);
                }

                const targetJid = remainingGroups[0]; 
                const groupName = participatingGroups[targetJid]?.subject || "Group";

                const prefix = process.env.PREFIX || ".";
                const promoMsg = `🚀 *Upgrade Your WhatsApp Experience with Vinnie Digital Hub!* 🚀\n\n` +
                    `Looking for the ultimate bot? We've got you covered! 🛠️✨\n\n` +
                    `🔥 *What I Can Do:* \n` +
                    `✅ Anti-Bot & Anti-Link Protection 🛡️\n` +
                    `✅ Fun Games & Economy System 🎮💰\n` +
                    `✅ Anti-Delete & Status Saver 📥\n` +
                    `✅ AI Chatbot & Image Generation 🤖🎨\n\n` +
                    `💡 *Start Now:* Type *${prefix}menu* to explore 98+ amazing features!\n\n` +
                    `👉 *Install the Bot Here:* https://comrades-md.gathuo.app\n\n` +
                    `Join the revolution today! 🌊 #VinnieDigital #InfiniteImpact`;

                // 🛡️ THE THROTTLE: Final check to ensure we aren't spamming
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
                
                await broadcastCol.insertOne({ jid: targetJid, timestamp: new Date() });
                console.log(`[PROMO_SUCCESS] Sent to: ${groupName}`);

            } catch (e) {
                // 🤫 SILENT FAIL: If it fails once, it won't spam your logs anymore
                if (e.message.includes('rate-overlimit')) {
                    console.log("⚠️ [PROMO_WAIT]: WhatsApp is busy. Skipping this hour...");
                } else {
                    console.error("🛰️ [PROMO_ERR]:", e.message);
                }
            }
        }, 3600000); // 1 Hour
    },

    async execute(sock) {
        // Prevent duplicate execution during hot-reloads
        if (!global.promoRunning) {
            setTimeout(() => this.startAutoPromotion(sock), 15000);
        }
    }
};

export default promoWorker;
