const hubClient = require('../../utils/hubClient');
const axios = require('axios');

// Step memory to keep index.js safe
global.promptState = global.promptState || new Map();

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(conn, m, args, { prefix }) {
        const sock = conn?.sendMessage ? conn : (m.conn || global.conn);
        const remoteJid = m.key.remoteJid;
        const sender = m.key.participant || remoteJid;
        const senderPhone = sender.split('@')[0].split(':')[0];
        const waName = m.pushName || "Comrade";
        const answer = args.join(" ").trim();

        // --- 1. THE GATEWAY MENU (Triggered by just '.prompt') ---
        if (!global.promptState.has(senderPhone) && args.length === 0) {
            const gatewayMenu = `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓
┃
┃ ✨ *ᴡᴇʟᴄᴏᴍᴇ,* ${waName}
┃ 🏦 *ᴠ-ʜᴜʙ ꜰɪɴᴀɴᴄᴇ ɢᴀᴛᴇᴡᴀʏ*
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🆕 *[ .new ]* ┃ _Create a Wallet_
┃
┃ 🔑 *[ .prompt id ]* ┃ _Member Deposit_
┃
┃ 👤 *[ .prompt guest ]* ┃ _Guest Deposit_
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 💡 *ᴛɪᴘ:* ᴛʏᴘᴇ ᴀ ᴄᴏᴍᴍᴀɴᴅ ᴛᴏ ʙᴇɢɪɴ.
┃ © 2026 | ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ
┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            return sock.sendMessage(remoteJid, { text: gatewayMenu }, { quoted: m });
        }

        // --- 2. INITIALIZING OR BYPASSING ---
        if (!global.promptState.has(senderPhone)) {
            if (answer.toLowerCase() === 'guest') {
                global.promptState.set(senderPhone, { step: 3, vHubId: "GUEST" });
                return sock.sendMessage(remoteJid, { text: "👤 *ᴠ-ʜᴜʙ:* Guest Mode. Reply with `.prompt <amount> <phone>`" });
            } else if (answer.toLowerCase() === 'id') {
                global.promptState.set(senderPhone, { step: 2 });
                return sock.sendMessage(remoteJid, { text: "🔑 *ᴠ-ʜᴜʙ:* Member Mode. Reply with `.prompt <WalletID>` (e.g. 1001)" });
            } else if (args.length >= 2) {
                // AUTO-GUEST BYPASS: If they type '.prompt 10 07xxx' directly
                global.promptState.set(senderPhone, { step: 3, vHubId: "GUEST" });
            } else if (args.length === 1 && !isNaN(args[0])) {
                // If they just type '.prompt 10', assume Guest for sender's phone
                 global.promptState.set(senderPhone, { step: 3, vHubId: "GUEST" });
            }
        }

        let state = global.promptState.get(senderPhone);

        // --- 🛡️ EMERGENCY RECOVERY ---
        if (!state) {
            return sock.sendMessage(remoteJid, { text: `⚠️ *ᴠ-ʜᴜʙ:* Session lost. Type \`${prefix}prompt\` to restart.` });
        }

        // --- STEP 3: HANDLE WALLET ID ---
        if (state.step === 2) {
            const vHubId = answer.toUpperCase().startsWith('VH-') ? answer.toUpperCase() : `VH-${answer}`;
            state.vHubId = vHubId;
            state.step = 3;
            return sock.sendMessage(remoteJid, { text: `✅ *ᴛᴀʀɢᴇᴛ:* ${vHubId}\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* Amount and Phone?\n💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 10 07xxxxxxxx\`` });
        }

        // --- STEP 4: EXECUTE STK ---
        if (state.step === 3) {
            const [amount, phoneInput] = answer.split(" ");
            let phone = phoneInput || senderPhone;

            if (!amount || isNaN(amount)) {
                return sock.sendMessage(remoteJid, { text: "❌ *ᴇʀʀᴏʀ:* Please provide an amount." });
            }

            if (phone.startsWith('0')) phone = '254' + phone.slice(1);
            global.promptState.delete(senderPhone); // Clear memory

            const msg = await sock.sendMessage(remoteJid, { text: `⏳ *ᴠ-ʜᴜʙ:* Sending STK to ${phone}...` });

            try {
                const result = await hubClient.deposit(phone, amount, remoteJid, state.vHubId);
                if (result && (result.ResponseCode === "0" || result.success)) {
                    await sock.sendMessage(remoteJid, { 
                        text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴘᴀʏ* ✿ ━━━━━┓\n┃\n┃ ✅ *sᴛᴋ ᴘᴜsʜ sᴇɴᴛ!*\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${amount}\n┃ 🆔 *ᴅᴇsᴛɪɴᴀᴛɪᴏɴ:* ${state.vHubId}\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃\n┃ 📢 *ᴀᴄᴛɪᴏɴ ʀᴇǫᴜɪʀᴇᴅ:*\n┃ ᴇɴᴛᴇʀ ᴍ-ᴘᴇsᴀ ᴘɪɴ ᴏɴ ʏᴏᴜʀ ᴘʜᴏɴᴇ.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                        edit: msg.key 
                    });

                    // 

                    let attempts = 0;
                    const checkInterval = setInterval(async () => {
                        attempts++;
                        try {
                            const PROXY_URL = "https://vhubg-27494ea43fc4.herokuapp.com";
                            const check = await axios.get(`${PROXY_URL}/api/check-status?phone=${phone}`);
                            if (check.data.status === "OK" && check.data.isRecent) {
                                clearInterval(checkInterval);
                                const tx = check.data.lastTransaction;
                                await sock.sendMessage(remoteJid, { 
                                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ʀᴇᴄᴇɪᴘᴛ* ✿ ━━━━━┓\n┃\n┃ ✅ *ᴘᴀʏᴍᴇɴᴛ ᴠᴇʀɪꜰɪᴇᴅ*\n┃ 💵 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${tx.amount}\n┃ 🆔 *ᴅᴇᴘᴏsɪᴛᴇᴅ ᴛᴏ:* ${state.vHubId}\n┃ 🏦 *ɴᴇᴡ ʙᴀʟ:* ᴋsʜ ${check.data.balance}\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                                });
                            }
                        } catch (e) {
                            if (attempts >= 4) {
                                clearInterval(checkInterval);
                                await sock.sendMessage(remoteJid, { text: "❌ *ᴠ-ʜᴜʙ:* Verification timeout." });
                            }
                        }
                    }, 10000);
                } else {
                    throw new Error("STK Failed");
                }
            } catch (err) {
                await sock.sendMessage(remoteJid, { text: "⚠️ *ᴠ-ʜᴜʙ:* Gateway Error." });
            }
        }
    }
};
