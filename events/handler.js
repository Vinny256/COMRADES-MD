const fs = require('fs-extra');
const express = require('express');
const { downloadContentFromMessage, delay } = require("@whiskeysockets/baileys");
const path = require('path');

// --- 🛡️ STATUS TRACKER & QUEUE CONFIG ---
const statusMemoryFile = './reacted_statuses.json';
if (!fs.existsSync(statusMemoryFile)) {
    fs.writeJsonSync(statusMemoryFile, []);
}

if (!global.statusTracker) {
    global.statusTracker = new Set();
}

// 🚦 QUEUE ENGINE GLOBALS
if (!global.statusQueue) global.statusQueue = [];
if (global.isProcessingStatus === undefined) global.isProcessingStatus = false;

const app = express();
app.use(express.json());

let listenerActive = false;

// --- 🛠️ HELPER: QUEUE PROCESSOR ---
async function processStatusQueue(sock, settings) {
    if (global.isProcessingStatus || global.statusQueue.length === 0) return;
    global.isProcessingStatus = true;

    while (global.statusQueue.length > 0) {
        const item = global.statusQueue.shift();
        const { msg, statusId, participant, from } = item;

        try {
            // 1. Human-like delay (30-60 seconds between each view)
            // This prevents the "Bad MAC" wall of errors
            await delay(Math.floor(Math.random() * 30000) + 30000);

            // 2. Mark as Seen
            await sock.readMessages([msg.key]);

            // 3. Optional: React
            if (settings.autoreact) {
                const emojis = ['🔥', '🫡', '⭐', '🚀', '💎', '❤️', '✅'];
                const reaction = emojis[Math.floor(Math.random() * emojis.length)];
                
                // Small delay between viewing and reacting
                await delay(2000); 
                
                await sock.sendMessage(from, { 
                    react: { key: msg.key, text: reaction } 
                }, { 
                    statusJidList: [participant] 
                });
            }

            // ✅ Update Memories
            global.statusTracker.add(statusId);
            let reactedList = fs.readJsonSync(statusMemoryFile);
            reactedList.push(statusId);
            if (reactedList.length > 500) reactedList.shift();
            fs.writeJsonSync(statusMemoryFile, reactedList);

            console.log(`[ QUEUE ] Viewed & Reacted: ${participant}`);

        } catch (e) {
            console.error("┃ ❌ QUEUE_PROCESS_ERR:", e.message);
        }
    }
    global.isProcessingStatus = false;
}

module.exports = {
    async execute(sock, msg, settings) {
        // --- 1. V_HUB NOTIFICATION LISTENER ---
        if (!listenerActive) {
            try {
                const PORT = process.env.PORT || 3000;
                app.post('/v_hub_notify', async (req, res) => {
                    const { jid, text } = req.body;
                    const secret = req.headers['x-vhub-secret'];
                    if (secret !== "Vinnie_Bot_Wallet") return res.sendStatus(403);
                    try {
                        await sock.sendMessage(jid, { text: text });
                        res.status(200).send({ status: "Sent" });
                    } catch (err) {
                        res.status(500).send({ error: "WA_SEND_FAIL" });
                    }
                });

                if (!global.vHubRunning) {
                    app.listen(PORT, () => {
                        console.log(`\n┏━━━━━ ✿ V_HUB_LISTENER_ACTIVE ✿ ━━━━━┓`);
                        console.log(`┃   PORT: ${PORT}                      ┃`);
                        console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
                    });
                    global.vHubRunning = true;
                }
                listenerActive = true;
            } catch (setupError) {
                console.log("┃ ⚠️ V_HUB_LISTENER: Setup failed.");
            }
        }

        const from = msg.key.remoteJid;

        // --- 2. ANTI-VIEWONCE ENGINE ---
        const viewOnceType = msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessage;
        if (viewOnceType && settings.antiviewonce) {
            try {
                const viewOnceContent = viewOnceType.message;
                const mediaKey = Object.keys(viewOnceContent)[0]; 
                const mediaType = mediaKey.replace('Message', '');
                const stream = await downloadContentFromMessage(viewOnceContent[mediaKey], mediaType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                const revealCaption = `┏━━━━━ ✿ *V_HUB_REVEAL* ✿ ━━━━━┓\n┃\n┃ ✅ *VIEW_ONCE_BYPASSED*\n┃ 👤 *FROM:* ${msg.pushName || 'User'}\n┃ 📂 *TYPE:* ${mediaType.toUpperCase()}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                await sock.sendMessage(from, { [mediaType]: buffer, caption: viewOnceContent[mediaKey].caption || revealCaption }, { quoted: msg });
                buffer = null;
            } catch (e) {
                console.error("┃ ❌ VIEW_ONCE_REVEAL_FAIL:", e.message);
            }
        }

        // --- 3. MANUAL .vv COMMAND ---
        const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").trim().toLowerCase();
        if (text === '.vv') {
            const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedVO = quotedMsg?.viewOnceMessageV2 || quotedMsg?.viewOnceMessage;
            if (quotedVO) {
                try {
                    const voContent = quotedVO.message;
                    const voKey = Object.keys(voContent)[0];
                    const voType = voKey.replace('Message', '');
                    const voStream = await downloadContentFromMessage(voContent[voKey], voType);
                    let voBuffer = Buffer.from([]);
                    for await (const chunk of voStream) { voBuffer = Buffer.concat([voBuffer, chunk]); }
                    await sock.sendMessage(from, { [voType]: voBuffer, caption: `📑 *V_HUB:* Manual Extract Successful.` }, { quoted: msg });
                    voBuffer = null; 
                } catch (err) {
                    await sock.sendMessage(from, { text: "❌ Failed to extract media." });
                }
            }
        }

        // --- 4. STATUS ENGINE (QUEUED & STABLE) ---
        if (from === 'status@broadcast' && settings.autoview) {
            const statusId = msg.key.id;
            const participant = msg.key.participant || msg.key.remoteJid;

            // Block duplicates
            if (global.statusTracker.has(statusId)) return;
            let reactedList = fs.readJsonSync(statusMemoryFile);
            if (reactedList.includes(statusId)) {
                global.statusTracker.add(statusId);
                return;
            }

            // ADD TO QUEUE instead of immediate processing
            global.statusQueue.push({ msg, statusId, participant, from });
            processStatusQueue(sock, settings);
        }
    }
};