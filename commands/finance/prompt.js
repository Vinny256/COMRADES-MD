const hubClient = require('../../utils/hubClient');

// Global memory for steps
global.promptState = global.promptState || new Map();

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(sock, msg, args) {
        // --- 1. DEFINE VARIABLES SAFELY ---
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0];
        const input = args.join(" ").trim();
        const prefix = "."; // Hardcoded for safety

        // --- 2. GET OR CREATE STATE ---
        let state = global.promptState.get(senderPhone);

        // --- 3. THE LOGIC SWITCH ---
        try {
            // IF NO STATE AND NO ARGS -> SHOW MENU
            if (!state && !input) {
                const menu = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ* ✿ ━━━━━┓\n┃\n┃ 🆕 *.new* - ʀᴇɢɪsᴛᴇʀ\n┃ 🔑 *${prefix}prompt id* - ᴅᴇᴘᴏsɪᴛ\n┃ 👤 *${prefix}prompt guest* - ɢᴜᴇsᴛ\n┃\n┗━━━━━━━━━━━━━━━━━━━━┛`;
                return await sock.sendMessage(from, { text: menu });
            }

            // START PATHS
            if (!state) {
                if (input === 'id') {
                    global.promptState.set(senderPhone, { step: 1 });
                    return await sock.sendMessage(from, { text: "🔑 *ᴠ-ʜᴜʙ:* ᴇɴᴛᴇʀ ᴡᴀʟʟᴇᴛ ɪᴅ (ᴇ.ɢ. 1001)" });
                }
                if (input === 'guest') {
                    global.promptState.set(senderPhone, { step: 3, vHubId: "GUEST" });
                    return await sock.sendMessage(from, { text: "👤 *ᴠ-ʜᴜʙ:* ᴇɴᴛᴇʀ <ᴀᴍᴏᴜɴᴛ> <ᴘʜᴏɴᴇ>" });
                }
            }

            // HANDLE STEPS
            if (state.step === 1) {
                state.vHubId = input.toUpperCase().includes('VH-') ? input.toUpperCase() : `VH-${input}`;
                state.step = 2;
                return await sock.sendMessage(from, { text: `✅ *ɪᴅ:* ${state.vHubId}\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* ʜᴏᴡ ᴍᴜᴄʜ?` });
            }

            if (state.step === 2) {
                state.amount = input;
                state.step = 3;
                return await sock.sendMessage(from, { text: `💰 *ᴀᴍᴏᴜɴᴛ:* ${state.amount}\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ ᴘʜᴏɴᴇ ᴛᴏ ᴘʀᴏᴍᴘᴛ.` });
            }

            // FINAL STK TRIGGER
            if (state.step === 3) {
                let amt, ph;
                if (state.vHubId === "GUEST") {
                    [amt, ph] = input.split(" ");
                } else {
                    amt = state.amount;
                    ph = input;
                }

                if (ph.startsWith('0')) ph = '254' + ph.slice(1);
                global.promptState.delete(senderPhone);

                await sock.sendMessage(from, { text: "🚀 *ᴠ-ʜᴜʙ:* sᴇɴᴅɪɴɢ sᴛᴋ..." });

                // CRITICAL: We don't await the polling here to prevent hanging
                hubClient.deposit(ph, amt, from, state.vHubId || "GUEST")
                    .then(res => {
                        sock.sendMessage(from, { text: `✅ *sᴛᴋ sᴇɴᴛ ᴛᴏ ${ph}*\nʀᴇꜰᴇʀᴇɴᴄᴇ: ${state.vHubId || 'ɢᴜᴇsᴛ'}` });
                    })
                    .catch(e => {
                        sock.sendMessage(from, { text: "❌ *ᴍ-ᴘᴇsᴀ ᴇʀʀᴏʀ*" });
                    });
            }

        } catch (err) {
            console.log("CRITICAL ERROR IN PROMPT:", err);
            // Even if it fails, try to send a message
            await sock.sendMessage(from, { text: "⚠️ *sʏsᴛᴇᴍ ᴄʀᴀsʜ:* ᴄʜᴇᴄᴋ ʟᴏɢs." });
        }
    }
};
