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

        // --- STEP 1: THE GATEWAY SELECTION ---
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

        // --- STEP 2: INITIALIZING THE FLOW ---
        if (!global.promptState.has(senderPhone)) {
            if (answer.toLowerCase() === 'guest') {
                global.promptState.set(senderPhone, { step: 3, isGuest: true, vHubId: "GUEST" });
                return sock.sendMessage(remoteJid, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ɢᴜᴇsᴛ* ✿ ━━━━━┓\n┃\n┃ 👤 *ᴍᴏᴅᴇ:* ǫᴜɪᴄᴋ ᴅᴇᴘᴏsɪᴛ\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ ᴀᴍᴏᴜɴᴛ ᴀɴᴅ ᴘʜᴏɴᴇ.\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 10 07xxxxxxxx\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: m });
            } else if (answer.toLowerCase() === 'id') {
                global.promptState.set(senderPhone, { step: 2 });
                return sock.sendMessage(remoteJid, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴍᴇᴍʙᴇʀ* ✿ ━━━━━┓\n┃\n┃ 🔑 *ᴍᴏᴅᴇ:* ᴡᴀʟʟᴇᴛ ᴅᴇᴘᴏsɪᴛ\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜᴀᴛ ɪs ʏᴏᴜʀ ᴡᴀʟʟᴇᴛ ɪᴅ?\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 1001\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: msg });
            }
        }

        const state = global.promptState.get(senderPhone);

        // --- STEP 3: HANDLE WALLET ID & ASK FOR AMOUNT ---
        if (state.step === 2) {
            const vHubId = answer.includes('VH-') ? answer.toUpperCase() : `VH-${answer}`;
            state.vHubId = vHubId;
            state.step = 3;
            return sock.sendMessage(remoteJid, { 
                text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ʙᴀɴᴋ* ✿ ━━━━━┓\n┃\n┃ ✅ *ɪᴅ ᴛᴀʀɢᴇᴛ:* ${vHubId}\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ ᴀᴍᴏᴜɴᴛ ᴀɴᴅ ᴘʜᴏɴᴇ.\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 50 07xxxxxxxx\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            }, { quoted: m });
        }

        // --- STEP 4: EXECUTE THE STK PUSH ---
        if (state.step === 3) {
            const [amount, phoneInput] = answer.split(" ");
            let phone = phoneInput || senderPhone;

            if (!amount || isNaN(amount) || !phone) {
                return sock.sendMessage(remoteJid, { text: `❌ *ɪɴᴠᴀʟɪᴅ ɪɴᴘᴜᴛ*\nUsage: \`${prefix}prompt <amount> <phone>\`` });
            }

            if (phone.startsWith('0')) phone = '254' + phone.slice(1);
            global.promptState.delete(senderPhone); // Clear memory

            const msg = await sock.sendMessage(remoteJid, { text: `⏳ *ᴠ-ʜᴜʙ:* sᴇɴᴅɪɴɢ sᴛᴋ ᴘᴜsʜ ᴛᴏ ${phone}...` }, { quoted: m });

            try {
                // Trigger STK Push via Proxy
                const result = await hubClient.deposit(phone, amount, remoteJid, state.vHubId);

                if (result && (result.ResponseCode === "0" || result.success)) {
                    const waitingText = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴘᴀʏ* ✿ ━━━━━┓\n┃\n┃ ✅ *sᴛᴋ ᴘᴜsʜ sᴇɴᴛ!*\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${amount}\n┃ 🆔 *ᴅᴇsᴛɪɴᴀᴛɪᴏɴ:* ${state.vHubId}\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃\n┃ 📢 *ᴀᴄᴛɪᴏɴ ʀᴇǫᴜɪʀᴇᴅ:*\n┃ 1. ᴇɴᴛᴇʀ ᴍ-ᴘᴇsᴀ ᴘɪɴ.\n┃ 2. ᴡᴀɪᴛ ꜰᴏʀ ᴀᴜᴛᴏ-ᴠᴇʀɪꜰɪᴄᴀᴛɪᴏɴ.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                    await sock.sendMessage(remoteJid, { text: waitingText, edit: msg.key });

                    // POLLING ENGINE
                    let attempts = 0;
                    const checkInterval = setInterval(async () => {
                        attempts++;
                        try {
                            const PROXY_URL = "https://vhubg-27494ea43fc4.herokuapp.com";
                            const check = await axios.get(`${PROXY_URL}/api/check-status?phone=${phone}`);
                            
                            if (check.data.status === "OK" && check.data.isRecent) {
                                clearInterval(checkInterval);
                                const tx = check.data.lastTransaction;
                                const successReceipt = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ʀᴇᴄᴇɪᴘᴛ* ✿ ━━━━━┓\n┃\n┃ ✅ *ᴘᴀʏᴍᴇɴᴛ ᴠᴇʀɪꜰɪᴇᴅ*\n┃ 💵 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${tx.amount}\n┃ 🆔 *ᴅᴇᴘᴏsɪᴛᴇᴅ ᴛᴏ:* ${state.vHubId}\n┃ 🧾 *ʀᴇꜰ:* ${tx.receipt}\n┃ 🏦 *ɴᴇᴡ ʙᴀʟ:* ᴋsʜ ${check.data.balance}\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                                await sock.sendMessage(remoteJid, { text: successReceipt }, { quoted: m });
                            }
                        } catch (e) {
                            if (attempts >= 4) {
                                clearInterval(checkInterval);
                                const errorText = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴛɪᴍᴇᴏᴜᴛ* ✿ ━━━━━┓\n┃\n┃ ❌ *ᴠᴇʀɪꜰɪᴄᴀᴛɪᴏɴ ꜰᴀɪʟᴇᴅ*\n┃ \n┃ ᴍ-ᴘᴇsᴀ ɪs ᴅᴇʟᴀʏᴇᴅ ᴏʀ ᴘɪɴ ɴᴏᴛ \n┃ ᴇɴᴛᴇʀᴇᴅ. ᴄʜᴇᴄᴋ ʙᴀʟᴀɴᴄᴇ ʟᴀᴛᴇʀ.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                                await sock.sendMessage(remoteJid, { text: errorText, edit: msg.key });
                            }
                        }
                    }, 10000);
                } else {
                    await sock.sendMessage(remoteJid, { text: `❌ *ᴠ-ʜᴜʙ:* sᴛᴋ ᴄᴏᴜʟᴅ ɴᴏᴛ ʙᴇ ɪɴɪᴛɪᴀᴛᴇᴅ.`, edit: msg.key });
                }
            } catch (err) {
                await sock.sendMessage(remoteJid, { text: "⚠️ *ᴠ-ʜᴜʙ:* sᴇʀᴠᴇʀ ᴏꜰꜰʟɪɴᴇ.", edit: msg.key });
            }
        }
    }
};
