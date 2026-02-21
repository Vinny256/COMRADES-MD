const { downloadContentFromMessage, delay } = require("@whiskeysockets/baileys");
const express = require('express');

// --- 🧠 VOLATILE MEMORY (No Storage) ---
// Lives in RAM. Reset on restart. No files created.
if (!global.statusHistory) global.statusHistory = new Set();
if (!global.statusQueue) global.statusQueue = [];
if (global.isProcessingStatus === undefined) global.isProcessingStatus = false;

const app = express();
app.use(express.json());
let listenerActive = false;

// --- 🚦 ATOMIC QUEUE PROCESSOR ---
// Ensures bot views one status at a time to prevent crashing.
async function processStatusQueue(sock, settings) {
    if (global.isProcessingStatus || global.statusQueue.length === 0) return;
    global.isProcessingStatus = true;

    while (global.statusQueue.length > 0) {
        const item = global.statusQueue.shift();
        const { msg, participant, pushName } = item;

        try {
            // Random delay to mimic a human looking at the status
            await delay(Math.floor(Math.random() * 3000) + 2000);

            // THE ACTION: Marks the status as "Viewed"
            await sock.readMessages([msg.key]);
            console.log(`✅ [VIEWED] Status from: ${pushName || participant}`);

            // Optional: Auto-React if settings allow
            if (settings.autoreact) {
                const emojis = ['🔥', '🫡', '⭐', '🚀', '❤️', '✅'];
                const reaction = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(msg.key.remoteJid, { 
                    react: { key: msg.key, text: reaction } 
                }, { statusJidList: [participant] });
            }
        } catch (e) {
            console.error("┃ ❌ STATUS_VIEW_ERR:", e.message);
        }
    }
    global.isProcessingStatus = false;
}

module.exports = {
    async execute(sock, msg, settings) {
        const from = msg.key.remoteJid;

        // --- 1. GHOST TYPING (Remains Intact) ---
        if (from !== 'status@broadcast' && !msg.key.fromMe) {
            try {
                await sock.presenceSubscribe(from); 
                await sock.sendPresenceUpdate('composing', from);
                await delay(2000); 
                await sock.sendPresenceUpdate('paused', from);
            } catch (pErr) {}
        }

        // --- 2. V_HUB NOTIFICATION LISTENER (Remains Intact) ---
        if (!listenerActive) {
            try {
                const PORT = process.env.PORT || 3000;
                app.post('/v_hub_notify', async (req, res) => {
                    const { jid, text } = req.body;
                    if (req.headers['x-vhub-secret'] !== "Vinnie_Bot_Wallet") return res.sendStatus(403);
                    await sock.sendMessage(jid, { text: text });
                    res.status(200).send({ status: "Sent" });
                });
                if (!global.vHubRunning) {
                    app.listen(PORT, () => console.log(`\n┏━━━━━ ✿ V_HUB_LISTENER_ACTIVE ✿ ━━━━━┓`));
                    global.vHubRunning = true;
                }
                listenerActive = true;
            } catch (setupError) {}
        }

        // --- 3. ANTI-VIEWONCE & MANUAL .vv (Remains Intact) ---
        const viewOnceType = msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessage;
        const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").trim().toLowerCase();

        if (viewOnceType && settings.antiviewonce) {
            try {
                const content = viewOnceType.message;
                const type = Object.keys(content)[0].replace('Message', '');
                const stream = await downloadContentFromMessage(content[Object.keys(content)[0]], type);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                await sock.sendMessage(from, { [type]: buffer, caption: `📑 *V_HUB:* ViewOnce Revealed.` }, { quoted: msg });
            } catch (e) {}
        }

        if (text === '.vv') {
            const quotedVO = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2;
            if (quotedVO) {
                try {
                    const type = Object.keys(quotedVO.message)[0].replace('Message', '');
                    const stream = await downloadContentFromMessage(quotedVO.message[Object.keys(quotedVO.message)[0]], type);
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                    await sock.sendMessage(from, { [type]: buffer, caption: `📑 *V_HUB:* Manual Extract.` }, { quoted: msg });
                } catch (err) {}
            }
        }

        // --- 4. NEW STATUS ENGINE (NO STORAGE / QUEUED) ---
        if (from === 'status@broadcast' && settings.autoview) {
            const statusId = msg.key.id;
            const participant = msg.key.participant || msg.key.remoteJid;

            // Don't view the same status twice
            if (global.statusHistory.has(statusId)) return;
            global.statusHistory.add(statusId);

            // Clean RAM if history gets huge (prevents memory leaks)
            if (global.statusHistory.size > 500) {
                const firstItem = global.statusHistory.values().next().value;
                global.statusHistory.delete(firstItem);
            }

            // Push to the queue for sequential viewing
            global.statusQueue.push({ msg, participant, pushName: msg.pushName });
            processStatusQueue(sock, settings);
        }
    }
};