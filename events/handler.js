const { downloadContentFromMessage, delay } = require("@whiskeysockets/baileys");
const express = require('express');

// --- 🎨 STYLE UTILITY ---
const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

// --- 🧠 VOLATILE RAM STORAGE (Wiped on Restart - No Storage) ---
if (!global.statusHistory) global.statusHistory = new Set();
if (!global.statusQueue) global.statusQueue = [];
if (global.isProcessingStatus === undefined) global.isProcessingStatus = false;
if (!global.groupCache) global.groupCache = new Map(); 

const app = express();
app.use(express.json());
let listenerActive = false;

// --- 🚦 QUEUE PROCESSOR (Atomic & Storage-Free) ---
async function processStatusQueue(sock, settings) {
    if (global.isProcessingStatus || global.statusQueue.length === 0) return;
    global.isProcessingStatus = true;
    while (global.statusQueue.length > 0) {
        const item = global.statusQueue.shift();
        const { msg, participant } = item;
        try {
            await delay(2000);
            await sock.readMessages([msg.key]);
            if (settings.autoreact) {
                const emojis = ['😊', '😈', '👺', '👹', '☠️', '💀', '🛀', '🏌️‍♂️'];
                const reaction = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(msg.key.remoteJid, { react: { key: msg.key, text: reaction } }, { statusJidList: [participant] });
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

        // 1. GHOST TYPING
        if (!isGroup && !isMe) {
            try {
                await sock.sendPresenceUpdate('composing', from);
                await delay(1000);
                await sock.sendPresenceUpdate('paused', from);
            } catch (e) {}
        }

        // 2. V_HUB LISTENER
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

        // 3. ANTI-VIEWONCE
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
                buffer = null; // Direct memory release
            } catch (e) {}
        }

        // 4. GROUP SECURITY (Optimized for Stability)
        if (isGroup && !isMe) {
            const isLink = settings.antilink && (textContent.includes('http://') || textContent.includes('https://'));
            const isTag = settings.antitag && (textContent.includes('@everyone') || textContent.includes('@all'));
            const isMention = settings.antimention && (msg.messageStubType === 40 || msg.messageStubType === 41);

            // ONLY if a trigger is detected, we do the heavy work
            if (isLink || isTag || isMention) {
                // Check Cache first (Don't ask the server "Who is Admin" every second)
                let metadata = global.groupCache.get(from);
                if (!metadata || (Date.now() - metadata.time > 600000)) { // 10 min cache
                    try {
                        metadata = { data: await sock.groupMetadata(from), time: Date.now() };
                        global.groupCache.set(from, metadata);
                    } catch (e) { return; }
                }

                const groupMetadata = metadata.data;
                const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const isBotAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin !== null;

                if (isMention) {
                    const target = msg.messageStubParameters[0];
                    const isTargetAdmin = groupMetadata.participants.find(p => p.id === target)?.admin !== null;
                    if (isTargetAdmin) {
                        await sock.sendMessage(from, { text: vStyle("Stubborn admin detected.") });
                    } else if (isBotAdmin) {
                        await sock.groupParticipantsUpdate(from, [target], "remove");
                        await sock.sendMessage(from, { text: vStyle("User removed for status mention.") });
                    }
                } else if (isBotAdmin) {
                    if (isLink || isTag) {
                        await sock.sendMessage(from, { delete: msg.key });
                        await sock.sendMessage(from, { text: vStyle(`${isLink ? "Link" : "Tag"} Deleted.`) });
                    }
                }
            }
        }

        // 5. STATUS ENGINE
        if (from === 'status@broadcast' && settings.autoview) {
            if (isMe || msg.message?.reactionMessage) return;
            const statusId = msg.key.id;
            if (global.statusHistory.has(statusId)) return;
            global.statusHistory.add(statusId);
            if (global.statusHistory.size > 200) global.statusHistory.clear(); // Keep RAM light
            global.statusQueue.push({ msg, participant: msg.key.participant || from });
            processStatusQueue(sock, settings);
        }
    }
};