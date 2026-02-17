const fs = require('fs-extra');
const express = require('express');

// Create a small internal server for the Proxy to talk to
const app = express();
app.use(express.json());

let listenerActive = false;

module.exports = {
    async execute(sock, msg, settings) {
        // --- 1. V_HUB NOTIFICATION LISTENER (FAILURE-PROOF) ---
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
                        console.log("┃ ⚠️ V_HUB_NOTIFY: Could not send message to WhatsApp.");
                        res.status(500).send({ error: "WA_SEND_FAIL" });
                    }
                });

                // Only bind the port if it's not already bound
                if (!global.vHubRunning) {
                    app.listen(PORT, () => {
                        console.log(`\n┏━━━━━ ✿ V_HUB_LISTENER_ACTIVE ✿ ━━━━━┓`);
                        console.log(`┃  PORT: ${PORT}                      ┃`);
                        console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
                    });
                    global.vHubRunning = true;
                }
                listenerActive = true;
            } catch (setupError) {
                console.log("┃ ⚠️ V_HUB_LISTENER: Setup failed, but bot is continuing...");
            }
        }

        const from = msg.key.remoteJid;

        // --- 2. AUTOMATION: STATUS ENGINE (UNTOUCHED) ---
        if (from === 'status@broadcast' && settings.autoview) {
            try {
                // Phase 1: Auto View
                await sock.readMessages([msg.key]);
                
                // Phase 2: Auto React (Only if enabled in settings.json)
                if (settings.autoreact) {
                    const emojis = ['🔥', '🫡', '⭐', '⚡', '✨', '💎', '🚀'];
                    const reaction = emojis[Math.floor(Math.random() * emojis.length)];
                    
                    await sock.sendMessage(from, { 
                        react: { key: msg.key, text: reaction } 
                    }, { statusJidList: [msg.key.participant] });

                    // Solid Terminal Logging for the Director
                    console.log(`+--- [#] STATUS_LOG [#] ---+`);
                    console.log(`|  USER: ${msg.pushName || 'Contact'}`);
                    console.log(`|  VIEW: SUCCESS`);
                    console.log(`|  REACT: ${reaction}`);
                    console.log(`+--------------------------+`);
                }
            } catch (e) {
                // Ignore errors if the status was deleted quickly
            }
        }
    }
};