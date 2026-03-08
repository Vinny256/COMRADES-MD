const { MongoClient } = require('mongodb');
const hubClient = require('../../utils/hubClient');
const axios = require('axios');

// Step memory
global.promptState = global.promptState || new Map();

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(sock, msg, args, { prefix }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0].split(':')[0];
        const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").trim();
        const argText = args.join(" ").trim();

        // 1. GET CURRENT STATE
        let state = global.promptState.get(senderPhone);

        // 2. TRIGGER THE MENU (If no state and no args)
        if (!state && !argText) {
            const menu = `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓\n┃\n┃ 🏦 *ᴠ-ʜᴜʙ ꜰɪɴᴀɴᴄᴇ ɢᴀᴛᴇᴡᴀʏ*\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃\n┃ 🆕 *[ ${prefix}new ]* ┃ _Create New Wallet_\n┃\n┃ 🔑 *[ ${prefix}prompt id ]* ┃ _Deposit to Wallet_\n┃\n┃ 👤 *[ ${prefix}prompt guest ]* ┃ _Quick Deposit_\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃ 💡 *ᴛɪᴘ:* ᴛʏᴘᴇ ᴀ ᴄᴏᴍᴍᴀɴᴅ ᴛᴏ ʙᴇɢɪɴ.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            return await sock.sendMessage(from, { text: menu }, { quoted: msg });
        }

        // 3. START A PATH
        if (!state) {
            if (argText.toLowerCase() === 'id') {
                global.promptState.set(senderPhone, { step: 'id' });
                return await sock.sendMessage(from, { text: "🔑 *ᴠ-ʜᴜʙ:* Enter your Wallet ID (e.g., 1001)" }, { quoted: msg });
            }
            if (argText.toLowerCase() === 'guest') {
                global.promptState.set(senderPhone, { step: 'guest_push', vHubId: "GUEST" });
                return await sock.sendMessage(from, { text: "👤 *ᴠ-ʜᴜʙ:* Enter Amount and Phone (e.g., 10 0712...)" }, { quoted: msg });
            }
        }

        // 4. PROCESS STEPS
        if (state) {
            // STEP: ID -> AMOUNT
            if (state.step === 'id') {
                const vHubId = argText.toUpperCase().startsWith('VH-') ? argText.toUpperCase() : `VH-${argText.toUpperCase()}`;
                state.vHubId = vHubId;
                state.step = 'amount';
                return await sock.sendMessage(from, { text: `✅ *ɪᴅ:* ${vHubId}\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* How much to deposit?` }, { quoted: msg });
            }

            // STEP: AMOUNT -> PHONE
            if (state.step === 'amount') {
                if (isNaN(argText)) return sock.sendMessage(from, { text: "❌ Numbers only!" });
                state.amount = argText;
                state.step = 'phone';
                return await sock.sendMessage(from, { text: `💰 *ᴀᴍᴏᴜɴᴛ:* KSH ${state.amount}\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* Enter M-Pesa number.` }, { quoted: msg });
            }

            // STEP: FINAL PUSH (Member or Guest)
            if (state.step === 'phone' || state.step === 'guest_push') {
                let fAmount, fPhone;
                if (state.step === 'phone') {
                    fAmount = state.amount; fPhone = argText;
                } else {
                    const parts = argText.split(" ");
                    fAmount = parts[0]; fPhone = parts[1];
                }

                if (!fAmount || !fPhone) return sock.sendMessage(from, { text: "❌ Missing info!" });
                if (fPhone.startsWith('0')) fPhone = '254' + fPhone.slice(1);

                global.promptState.delete(senderPhone); // Clear state before sending
                await sock.sendMessage(from, { text: "🚀 *ᴠ-ʜᴜʙ:* Sending STK..." });

                try {
                    // STK PUSH with AccountRef as VH-ID
                    const res = await hubClient.deposit(fPhone, fAmount, from, state.vHubId);
                    if (res.success || res.ResponseCode === "0") {
                        return await sock.sendMessage(from, { text: `✅ *sᴛᴋ sᴇɴᴛ!*\n\n💰 *ᴀᴍᴏᴜɴᴛ:* ${fAmount}\n🆔 *ʀᴇꜰ:* ${state.vHubId}\n\n📢 Enter PIN on your phone.` });
                    }
                } catch (e) {
                    return await sock.sendMessage(from, { text: "⚠️ Gateway Timeout." });
                }
            }
        }
    }
};
