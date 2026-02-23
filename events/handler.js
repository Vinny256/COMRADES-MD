const { downloadContentFromMessage, delay } = require("@whiskeysockets/baileys");
const express = require('express');

// --- 🎨 STYLE UTILITY ---
const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

// --- 🧠 VOLATILE RAM STORAGE ---
if (!global.statusHistory) global.statusHistory = new Set();
if (!global.statusQueue) global.statusQueue = [];
if (global.isProcessingStatus === undefined) global.isProcessingStatus = false;
if (!global.groupCache) global.groupCache = new Map(); 

const app = express();
app.use(express.json());
let listenerActive = false;

// --- 🚦 HUMANIZED QUEUE PROCESSOR ---
async function processStatusQueue(sock, settings) {
    if (global.isProcessingStatus || global.statusQueue.length === 0) return;
    global.isProcessingStatus = true;
    
    while (global.statusQueue.length > 0) {
        const item = global.statusQueue.shift();
        const { msg, participant } = item;
        
        try {
            // 🎲 RANDOM DELAY 1: Time to "click" the status (3-6s)
            const clickDelay = Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000;
            await delay(clickDelay);
            
            // Mark as read
            await sock.readMessages([msg.key]);

            if (settings.autoreact) {
                // 🎲 RANDOM DELAY 2: Time to "watch" the status before reacting (4-10s)
                const watchDelay = Math.floor(Math.random() * (10000 - 4000 + 1)) + 4000;
                await delay(watchDelay);

                const emojis = ['😊', '😈', '🔥', '✨', '💎', '🚀', '⚡', '✅'];
                const reaction = emojis[Math.floor(Math.random() * emojis.length)];
                
                await sock.sendMessage(msg.key.remoteJid, { 
                    react: { key: msg.key, text: reaction } 
                }, { statusJidList: [participant] });
            }
        } catch (e) {}
    }
    global.isProcessingStatus = false;
}

module.exports = {
    async execute(sock, msg, settings) {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const isMe = msg.key.fromMe;

        // 1. HUMANIZED GHOST TYPING
        if (!isGroup && !isMe && from !== 'status@broadcast') {
            try {
                // Only "type" randomly to stay under 512MB RAM
                if (Math.random() > 0.5) {
                    await sock.sendPresenceUpdate('composing', from);
                    await delay(Math.floor(Math.random() * 3000) + 1000);
                    await sock.sendPresenceUpdate('paused', from);
                }
            } catch (e) {}
        }

        // 2. V_HUB LISTENER (Kept intact)
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
            } catch (e) {}
        }

        // 3. ANTI-VIEWONCE (Kept intact)
        const viewOnceType = msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessage;
        const textContent = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").trim();
        const textLower = textContent.toLowerCase();

        if (viewOnceType && settings.antiviewonce) {
            try {
                const content = viewOnceType.message;
                const type = Object.keys(content)[0].replace('Message', '');
                const stream = await downloadContentFromMessage(content[Object.keys(content)[0]], type);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                await sock.sendMessage(from, { [type]: buffer, caption: vStyle("ViewOnce Revealed.") }, { quoted: msg });
                buffer = null; 
            } catch (e) {}
        }

        // 4. GROUP SECURITY (Optimized with Cache)
        if (isGroup && !isMe) {
            const isLink = settings.antilink && (textContent.includes('http://') || textContent.includes('https://'));
            const isTag = settings.antitag && (textContent.includes('@everyone') || textContent.includes('@all'));
            
            if (isLink || isTag) {
                let metadata = global.groupCache.get(from);
                if (!metadata || (Date.now() - metadata.time > 600000)) { 
                    try {
                        metadata = { data: await sock.groupMetadata(from), time: Date.now() };
                        global.groupCache.set(from, metadata);
                    } catch (e) { return; }
                }

                const groupMetadata = metadata.data;
                const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin !== null;

                if (isBotAdmin) {
                    await sock.sendMessage(from, { delete: msg.key });
                    await sock.sendMessage(from, { text: vStyle(`${isLink ? "Link" : "Tag"} Deleted.`) });
                }
            }
        }

        // 5. STATUS ENGINE (DEDUPLICATED & QUEUED)
        if (from === 'status@broadcast' && settings.autoview) {
            if (isMe || msg.message?.reactionMessage) return;
            
            // 🚀 FIX: DEDUPLICATION (The "Ghost" Fix)
            const statusId = msg.key.id;
            if (global.statusHistory.has(statusId)) return;
            global.statusHistory.add(statusId);
            
            // Keep the cache from growing too large
            if (global.statusHistory.size > 500) {
                const arr = Array.from(global.statusHistory);
                global.statusHistory = new Set(arr.slice(250)); 
            }

            global.statusQueue.push({ msg, participant: msg.key.participant || from });
            processStatusQueue(sock, settings);
        }

        // 6. STATUS SAVER
        if (textLower === '.save') {
            const quoted = msg.message?.extendedTextMessage?.contextInfo;
            if (quoted?.remoteJid === 'status@broadcast' && quoted.quotedMessage) {
                try {
                    const mType = Object.keys(quoted.quotedMessage)[0];
                    const type = mType.replace('Message', '');
                    const stream = await downloadContentFromMessage(quoted.quotedMessage[mType], type);
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                    await sock.sendMessage(from, { [type]: buffer, caption: vStyle("Status Captured.") }, { quoted: msg });
                    buffer = null;
                } catch (e) {}
            }
        }
    }
};