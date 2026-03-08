const { MongoClient } = require('mongodb');
const hubClient = require('../../utils/hubClient');
const axios = require('axios');

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
global.promptState = global.promptState || new Map();

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(conn, m, args, { prefix }) {
        const sock = conn?.sendMessage ? conn : (m.conn || global.conn);
        const remoteJid = m.key.remoteJid;
        const sender = m.key.participant || remoteJid;
        const senderPhone = sender.split('@')[0].split(':')[0];
        const answer = args.join(" ").trim();

        // --- STEP 1: INITIAL SELECTION ---
        if (!global.promptState.has(senderPhone) && args.length === 0) {
            const menu = `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓
┃
┃ 🏦 *ᴠ-ʜᴜʙ ꜰɪɴᴀɴᴄᴇ ɢᴀᴛᴇᴡᴀʏ*
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🔑 *[ .prompt id ]* ┃ _Deposit to Wallet_
┃
┃ 👤 *[ .prompt guest ]* ┃ _Quick Deposit_
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 💡 *ᴛɪᴘ:* ᴛʏᴘᴇ ᴀ ᴄᴏᴍᴍᴀɴᴅ ᴛᴏ ʙᴇɢɪɴ.
┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            return sock.sendMessage(remoteJid, { text: menu }, { quoted: m });
        }

        // --- STEP 2: INITIALIZING PATHS ---
        if (!global.promptState.has(senderPhone)) {
            if (answer.toLowerCase() === 'guest') {
                global.promptState.set(senderPhone, { step: 3, isGuest: true, vHubId: "GUEST" });
                return sock.sendMessage(remoteJid, { text: `👤 *ᴠ-ʜᴜʙ_ɢᴜᴇsᴛ:* \n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* Enter amount and phone.\n💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 10 07xxxxxxxx\`` });
            } else if (answer.toLowerCase() === 'id') {
                global.promptState.set(senderPhone, { step: 2 });
                return sock.sendMessage(remoteJid, { text: `🔑 *ᴠ-ʜᴜʙ_ᴍᴇᴍʙᴇʀ:* \n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* What is your Wallet ID?\n💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 1001\`` });
            }
        }

        const state = global.promptState.get(senderPhone);
        if (!state) return;

        // --- STEP 3: MEMBER PATH - HANDLE ID & ASK AMOUNT ---
        if (state.step === 2) {
            const vHubId = answer.toUpperCase().startsWith('VH-') ? answer.toUpperCase() : `VH-${answer}`;
            try {
                await client.connect();
                const user = await client.db("vinnieBot").collection("wallets").findOne({ vHubId });
                if (!user) {
                    global.promptState.delete(senderPhone);
                    return sock.sendMessage(remoteJid, { text: "❌ *ᴇʀʀᴏʀ:* Wallet ID not found." });
                }
                state.vHubId = user.vHubId;
                state.name = user.name;
                state.step = 2.5;
                return sock.sendMessage(remoteJid, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ᴀᴜᴛʜ* ✿ ━━━━━┓\n┃\n┃ ✨ *ᴡᴇʟᴄᴏᴍᴇ,* ${user.name}\n┃ 🆔 *ɪᴅ:* ${user.vHubId}\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ʜᴏᴡ ᴍᴜᴄʜ ᴛᴏ ᴅᴇᴘᴏsɪᴛ?\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt <amount>\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: m });
            } catch (e) { return sock.sendMessage(remoteJid, { text: "⚠️ *ᴅʙ ᴇʀʀᴏʀ*" }); }
        }

        // --- STEP 4: MEMBER PATH - HANDLE AMOUNT & ASK PHONE ---
        if (state.step === 2.5) {
            if (isNaN(answer)) return sock.sendMessage(remoteJid, { text: "❌ *ᴇʀʀᴏʀ:* Enter a valid number for amount." });
            state.amount = answer;
            state.step = 2.8;
            return sock.sendMessage(remoteJid, { 
                text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ᴘᴀʏᴍᴇɴᴛ* ✿ ━━━━━┓\n┃\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${state.amount}\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* Enter M-Pesa number to prompt.\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 07xxxxxxxx\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            }, { quoted: m });
        }

        // --- STEP 5: FINAL EXECUTION (MEMBER & GUEST) ---
        if (state.step === 2.8 || state.step === 3) {
            let finalAmount, finalPhone;

            if (state.step === 2.8) { // Member path final
                finalAmount = state.amount;
                finalPhone = answer;
            } else { // Guest path final
                [finalAmount, finalPhone] = answer.split(" ");
            }

            if (!finalAmount || !finalPhone) return sock.sendMessage(remoteJid, { text: "❌ *ᴇʀʀᴏʀ:* Missing details." });

            if (finalPhone.startsWith('0')) finalPhone = '254' + finalPhone.slice(1);
            global.promptState.delete(senderPhone);

            const msg = await sock.sendMessage(remoteJid, { text: `🚀 *ᴠ-ʜᴜʙ:* Sending STK Push to ${finalPhone}...` });

            try {
                const result = await hubClient.deposit(finalPhone, finalAmount, remoteJid, state.vHubId);
                if (result.success || result.ResponseCode === "0") {
                    await sock.sendMessage(remoteJid, { 
                        text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴘᴀʏ* ✿ ━━━━━┓\n┃\n┃ ✅ *sᴛᴋ sᴇɴᴛ ᴛᴏ ${finalPhone}*\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${finalAmount}\n┃ 🆔 *ᴛᴀʀɢᴇᴛ:* ${state.vHubId}\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃ 📢 ᴇɴᴛᴇʀ ᴘɪɴ ᴏɴ ʏᴏᴜʀ ᴘʜᴏɴᴇ.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                        edit: msg.key 
                    });

                    

                    // --- START POLLING ---
                    let attempts = 0;
                    const checkInterval = setInterval(async () => {
                        attempts++;
                        try {
                            const PROXY_URL = "https://vhubg-27494ea43fc4.herokuapp.com";
                            const check = await axios.get(`${PROXY_URL}/api/check-status?phone=${finalPhone}`);
                            if (check.data.status === "OK" && check.data.isRecent) {
                                clearInterval(checkInterval);
                                const tx = check.data.lastTransaction;
                                const receipt = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ʀᴇᴄᴇɪᴘᴛ* ✿ ━━━━━┓\n┃\n┃ ✅ *ᴄᴏɴꜰɪʀᴍᴇᴅ ꜰᴏʀ ${state.vHubId}*\n┃ 💵 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${tx.amount}\n┃ 🧾 *ʀᴇꜰ:* ${tx.receipt}\n┃ 🏦 *ɴᴇᴡ ʙᴀʟ:* ᴋsʜ ${check.data.balance}\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                                await sock.sendMessage(remoteJid, { text: receipt });
                            }
                        } catch (e) { if (attempts >= 5) clearInterval(checkInterval); }
                    }, 10000);
                }
            } catch (err) { await sock.sendMessage(remoteJid, { text: "⚠️ Gateway Error." }); }
        }
    }
};
