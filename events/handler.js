const fs = require('fs-extra');
const express = require('express');
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

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
        const type = Object.keys(msg.message || {})[0];

        // --- 2. ANTI-VIEWONCE ENGINE (AUTO-REVEAL) ---
        const isViewOnce = msg.message?.viewOnceMessageV2 || msg.message?.viewOnceMessage;
        if (isViewOnce && settings.antiviewonce) {
            try {
                const viewOnceContent = isViewOnce.message;
                const mediaType = Object.keys(viewOnceContent)[0];
                const cleanType = mediaType.replace('Message', '');
                
                // Download to Memory Buffer (No Disk Storage)
                const stream = await downloadContentFromMessage(viewOnceContent[mediaType], cleanType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                const caption = `┏━━━━━ ✿ *V_HUB_REVEAL* ✿ ━━━━━┓\n┃\n┃ ✅ *VIEW_ONCE_BYPASSED*\n┃ 👤 *FROM:* ${msg.pushName || 'User'}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sock.sendMessage(from, { 
                    [cleanType]: buffer, 
                    caption: viewOnceContent[mediaType].caption || caption 
                }, { quoted: msg });
                
                // Clear buffer from memory immediately
                buffer = null;
            } catch (e) {
                console.log("┃ ❌ VIEW_ONCE_FAIL:", e.message);
            }
        }

        // --- 3. MANUAL .VV COMMAND (REPLY TO VIEW ONCE) ---
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        if (text.toLowerCase() === '.vv') {
            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const isQuotedViewOnce = quotedMsg?.viewOnceMessageV2 || quotedMsg?.viewOnceMessage;

            if (isQuotedViewOnce) {
                try {
                    const vContent = isQuotedViewOnce.message;
                    const vType = Object.keys(vContent)[0];
                    const vClean = vType.replace('Message', '');

                    const vStream = await downloadContentFromMessage(vContent[vType], vClean);
                    let vBuffer = Buffer.from([]);
                    for await (const chunk of vStream) {
                        vBuffer = Buffer.concat([vBuffer, chunk]);
                    }

                    await sock.sendMessage(from, { 
                        [vClean]: vBuffer, 
                        caption: `📑 *V_HUB:* Manual Extract Successful.` 
                    }, { quoted: msg });
                    
                    vBuffer = null; // Memory Cleanup
                } catch (err) {
                    await sock.sendMessage(from, { text: "❌ Failed to extract media." });
                }
            }
        }

        // --- 4. STATUS ENGINE ---
        if (from === 'status@broadcast' && settings.autoview) {
            try {
                await sock.readMessages([msg.key]);
                if (settings.autoreact) {
                    const emojis = ['🔥', '🫡', '⭐', '🚀', '💎'];
                    const reaction = emojis[Math.floor(Math.random() * emojis.length)];
                    await sock.sendMessage(from, { react: { key: msg.key, text: reaction } }, { statusJidList: [msg.key.participant] });
                }
            } catch (e) {}
        }
    }
};