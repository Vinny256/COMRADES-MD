const { downloadContentFromMessage, delay } = require("@whiskeysockets/baileys");
const express = require('express');

// --- 🎨 STYLE UTILITY (The Flower Box) ---
const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

// --- 🧠 VOLATILE MEMORY ---
if (!global.statusHistory) global.statusHistory = new Set();
if (!global.statusQueue) global.statusQueue = [];
if (global.isProcessingStatus === undefined) global.isProcessingStatus = false;

const app = express();
app.use(express.json());
let listenerActive = false;

// --- 🚦 ATOMIC QUEUE PROCESSOR ---
async function processStatusQueue(sock, settings) {
    if (global.isProcessingStatus || global.statusQueue.length === 0) return;
    global.isProcessingStatus = true;

    while (global.statusQueue.length > 0) {
        const item = global.statusQueue.shift();
        const { msg, participant, pushName } = item;
        try {
            await delay(Math.floor(Math.random() * 3000) + 2000);
            await sock.readMessages([msg.key]);
            console.log(`✅ [VIEWED] Status from: ${pushName || participant}`);

            if (settings.autoreact) {
                const emojis = ['😊', '😈', '👺', '👹', '☠️', '💀', '🛀', '🏌️‍♂️'];
                const reaction = emojis[Math.floor(Math.random() * emojis.length)];
                await sock.sendMessage(msg.key.remoteJid, { 
                    react: { key: msg.key, text: reaction } 
                }, { statusJidList: [participant] });
            }
        } catch (e) { }
    }
    global.isProcessingStatus = false;
}

module.exports = {
    async execute(sock, msg, settings) {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const isMe = msg.key.fromMe;

        // --- 1. GHOST TYPING (Remains Intact) ---
        if (!isGroup && !isMe) {
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

        // --- 3. ANTI-VIEWONCE & MANUAL .vv (Styled) ---
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
            } catch (e) {}
        }

        if (textLower === '.vv') {
            const quotedVO = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2;
            if (quotedVO) {
                try {
                    const type = Object.keys(quotedVO.message)[0].replace('Message', '');
                    const stream = await downloadContentFromMessage(quotedVO.message[Object.keys(quotedVO.message)[0]], type);
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                    await sock.sendMessage(from, { [type]: buffer, caption: vStyle("Manual Extract.") }, { quoted: msg });
                } catch (err) {}
            }
        }

        // --- 4. GROUP SECURITY GUARD (Anti-Link, Anti-Tag, Anti-Mention) ---
        if (isGroup && !isMe) {
            const groupMetadata = await sock.groupMetadata(from);
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const botInParticipants = groupMetadata.participants.find(p => p.id === botNumber);
            const isBotAdmin = botInParticipants?.admin !== null;

            // A. CHECK FOR STATUS MENTION (System Notification)
            // StubTypes 40/41 are for status mentions
            if (settings.antimention && (msg.messageStubType === 40 || msg.messageStubType === 41)) {
                const target = msg.messageStubParameters[0]; // The person who mentioned the group
                const targetInParticipants = groupMetadata.participants.find(p => p.id === target);
                const isTargetAdmin = targetInParticipants?.admin !== null;

                if (isTargetAdmin) {
                    // Scenario: Target is an Admin
                    await sock.sendMessage(from, { text: vStyle("I tried my best to remove the user but is a stubborn admin. Take care and don't mention us again!") });
                } else if (!isBotAdmin) {
                    // Scenario: Bot is not Admin
                    await sock.sendMessage(from, { text: vStyle("I detected a status mention! Promote me to Admin to perform a lesson teaching action.") });
                } else {
                    // Scenario: Bot is Admin, Target is User (KICK)
                    await sock.groupParticipantsUpdate(from, [target], "remove");
                    await sock.sendMessage(from, { text: vStyle("A lesson has been taught. User removed for unauthorized status mention.") });
                }
            }

            // B. CHECK FOR ANTI-LINK & ANTI-TAG
            if (isBotAdmin) {
                if (settings.antilink && (textContent.includes('http://') || textContent.includes('https://'))) {
                    await sock.sendMessage(from, { delete: msg.key });
                    await sock.sendMessage(from, { text: vStyle("Link Deleted. (Anti-Link)") });
                }
                if (settings.antitag && (textContent.includes('@everyone') || textContent.includes('@all'))) {
                    await sock.sendMessage(from, { delete: msg.key });
                    await sock.sendMessage(from, { text: vStyle("Tag Deleted. (Anti-Tag)") });
                }
            }
        }

        // --- 5. IMPROVED STATUS ENGINE ---
        if (from === 'status@broadcast' && settings.autoview) {
            if (isMe || msg.message?.reactionMessage) return;

            const hasContent = msg.message?.imageMessage || msg.message?.videoMessage || msg.message?.extendedTextMessage || msg.message?.conversation;
            if (!hasContent) return;

            const statusId = msg.key.id;
            const participant = msg.key.participant || msg.key.remoteJid;

            if (global.statusHistory.has(statusId)) return;
            global.statusHistory.add(statusId);

            if (global.statusHistory.size > 500) {
                const firstItem = global.statusHistory.values().next().value;
                global.statusHistory.delete(firstItem);
            }

            global.statusQueue.push({ msg, participant, pushName: msg.pushName });
            processStatusQueue(sock, settings);
        }
    }
};