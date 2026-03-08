const hubClient = require('../../utils/hubClient');

// Global memory for steps
global.promptState = global.promptState || new Map();

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(sock, msg, args) {
        try {
            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const senderPhone = sender.split('@')[0];
            const input = args.join(" ").trim();
            const prefix = "."; 

            // 1. GET CURRENT STATE
            let state = global.promptState.get(senderPhone);

            // 2. THE MAIN MENU (No state and no input)
            if (!state && !input) {
                const menu = `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓
┃
┃ 🏦 *ᴠ-ʜᴜʙ ꜰɪɴᴀɴᴄᴇ ɢᴀᴛᴇᴡᴀʏ*
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🆕 *[ ${prefix}new ]* ┃ _Create New Wallet_
┃
┃ 🔑 *[ ${prefix}prompt id ]* ┃ _Deposit to Wallet_
┃
┃ 👤 *[ ${prefix}prompt guest ]* ┃ _Quick Deposit_
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 💡 *ᴛɪᴘ:* ᴛʏᴘᴇ ᴀ ᴄᴏᴍᴍᴀɴᴅ ᴛᴏ ʙᴇɢɪɴ.
┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                return await sock.sendMessage(from, { text: menu });
            }

            // 3. STARTING THE PATHS
            if (!state) {
                if (input.toLowerCase() === 'id') {
                    global.promptState.set(senderPhone, { step: 1 });
                    return await sock.sendMessage(from, { text: "🔑 *ᴠ-ʜᴜʙ:* Enter your Wallet ID (e.g., 1001)" });
                }
                if (input.toLowerCase() === 'guest') {
                    global.promptState.set(senderPhone, { step: 3, vHubId: "GUEST" });
                    return await sock.sendMessage(from, { text: "👤 *ᴠ-ʜᴜʙ:* Enter Amount and Phone (e.g., 10 07xxxxxxxx)" });
                }
            }

            // 4. HANDLING STEPS (WITH SAFETY CHECKS)
            if (state) {
                // STEP 1: ID -> AMOUNT
                if (state.step === 1) {
                    const vHubId = input.toUpperCase().startsWith('VH-') ? input.toUpperCase() : `VH-${input.toUpperCase()}`;
                    state.vHubId = vHubId;
                    state.step = 2;
                    return await sock.sendMessage(from, { text: `✅ *ɪᴅ:* ${vHubId}\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* How much to deposit?` });
                }

                // STEP 2: AMOUNT -> PHONE
                if (state.step === 2) {
                    if (isNaN(input)) return sock.sendMessage(from, { text: "❌ Numbers only!" });
                    state.amount = input;
                    state.step = 3;
                    return await sock.sendMessage(from, { text: `💰 *ᴀᴍᴏᴜɴᴛ:* KSH ${state.amount}\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* Enter M-Pesa number to prompt.` });
                }

                // STEP 3: FINAL EXECUTION
                if (state.step === 3) {
                    let fAmount, fPhone;
                    if (state.vHubId === "GUEST") {
                        const parts = input.split(" ");
                        fAmount = parts[0]; fPhone = parts[1];
                    } else {
                        fAmount = state.amount; fPhone = input;
                    }

                    if (!fAmount || !fPhone) return sock.sendMessage(from, { text: "❌ Missing details. Please restart with `.prompt`" });
                    if (fPhone.startsWith('0')) fPhone = '254' + fPhone.slice(1);

                    global.promptState.delete(senderPhone); // Clear state
                    await sock.sendMessage(from, { text: "🚀 *ᴠ-ʜᴜʙ:* Sending STK Push..." });

                    const result = await hubClient.deposit(fPhone, fAmount, from, state.vHubId);
                    if (result.success || result.ResponseCode === "0") {
                        return await sock.sendMessage(from, { 
                            text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴘᴀʏ* ✿ ━━━━━┓\n┃\n┃ ✅ *sᴛᴋ sᴇɴᴛ!*\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${fAmount}\n┃ 🆔 *ʀᴇꜰᴇʀᴇɴᴄᴇ:* ${state.vHubId}\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃ 📢 Enter PIN on your phone.\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                        });
                    }
                }
            }

        } catch (err) {
            console.error("CRITICAL ERROR IN PROMPT:", err);
            global.promptState.delete(senderPhone); // Reset on error
        }
    }
};
