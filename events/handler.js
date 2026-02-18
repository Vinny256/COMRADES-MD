const fs = require('fs-extra');
const express = require('express');
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const path = require('path');

// --- 🛡️ STATUS TRACKER CONFIG ---
const statusMemoryFile = './reacted_statuses.json';
if (!fs.existsSync(statusMemoryFile)) {
    fs.writeJsonSync(statusMemoryFile, []);
}

// Create a small internal server for the Proxy to talk to
const app = express();
app.use(express.json());

let listenerActive = false;

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

        // --- 2. ANTI-VIEWONCE ENGINE (AUTO-REVEAL) ---
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

                await sock.sendMessage(from, { 
                    [mediaType]: buffer, 
                    caption: viewOnceContent[mediaKey].caption || revealCaption 
                }, { quoted: msg });
                
                buffer = null;
            } catch (e) {
                console.error("┃ ❌ VIEW_ONCE_REVEAL_FAIL:", e.message);
            }
        }

        // --- 3. MANUAL .vv COMMAND (REPLY TO VIEW ONCE) ---
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim().toLowerCase();
        
        if (text === '.vv') {
            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const quotedVO = quotedMsg?.viewOnceMessageV2 || quotedMsg?.viewOnceMessage;

            if (quotedVO) {
                try {
                    const voContent = quotedVO.message;
                    const voKey = Object.keys(voContent)[0];
                    const voType = voKey.replace('Message', '');

                    const voStream = await downloadContentFromMessage(voContent[voKey], voType);
                    let voBuffer = Buffer.from([]);
                    for await (const chunk of voStream) {
                        voBuffer = Buffer.concat([voBuffer, chunk]);
                    }

                    await sock.sendMessage(from, { 
                        [voType]: voBuffer, 
                        caption: `📑 *V_HUB:* Manual Extract Successful.` 
                    }, { quoted: msg });
                    
                    voBuffer = null; 
                } catch (err) {
                    await sock.sendMessage(from, { text: "❌ Failed to extract media. It might have expired." });
                }
            } else {
                await sock.sendMessage(from, { text: "⚠️ Reply to a ViewOnce message with .vv" });
            }
        }

        // --- 4. STATUS ENGINE (WITH PERSISTENT ANTI-SPAM) ---
        if (from === 'status@broadcast' && settings.autoview) {
            const statusId = msg.key.id;
            let reactedList = fs.readJsonSync(statusMemoryFile);

            // 🛑 Check if this specific status has already been handled
            if (reactedList.includes(statusId)) return;

            try {
                // View the status
                await sock.readMessages([msg.key]);

                // React to the status
                if (settings.autoreact) {
                    const emojis = ['🔥', '🫡', '⭐', '🚀', '💎'];
                    const reaction = emojis[Math.floor(Math.random() * emojis.length)];
                    await sock.sendMessage(from, { 
                        react: { key: msg.key, text: reaction } 
                    }, { 
                        statusJidList: [msg.key.participant] 
                    });
                }

                // Save to memory
                reactedList.push(statusId);
                if (reactedList.length > 500) reactedList.shift(); // Keep memory lean
                fs.writeJsonSync(statusMemoryFile, reactedList);

            } catch (e) {}
        }
    }
};