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
        const answer = args.join(" ").trim().toLowerCase();

        // --- STEP 1: THE MAIN MENU (If no args OR if they just type .prompt) ---
        if (args.length === 0 || !global.promptState.has(senderPhone)) {
            // Check if they are trying to start a path immediately
            if (answer === 'id') {
                global.promptState.set(senderPhone, { step: 2 });
                return sock.sendMessage(remoteJid, { text: `🔑 *ᴠ-ʜᴜʙ_ᴍᴇᴍʙᴇʀ*\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* What is your Wallet ID?\n💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 1001\`` }, { quoted: m });
            } 
            if (answer === 'guest') {
                global.promptState.set(senderPhone, { step: 3, vHubId: "GUEST" });
                return sock.sendMessage(remoteJid, { text: `👤 *ᴠ-ʜᴜʙ_ɢᴜᴇsᴛ*\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* Enter amount and phone.\n💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 10 07xxxxxxxx\`` }, { quoted: m });
            }

            // Otherwise, show the Welcome Menu
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
            return sock.sendMessage(remoteJid, { text: menu }, { quoted: m });
        }

        const state = global.promptState.get(senderPhone);

        // --- STEP 2: MEMBER PATH - HANDLE ID ---
        if (state.step === 2) {
            const vHubId = answer.toUpperCase().startsWith('VH-') ? answer.toUpperCase() : `VH-${answer.toUpperCase()}`;
            try {
                await client.connect();
                const user = await client.db("vinnieBot").collection("wallets").findOne({ vHubId });
                if (!user) {
                    global.promptState.delete(senderPhone);
                    return sock.sendMessage(remoteJid, { text: "❌ *ᴇʀʀᴏʀ:* Wallet ID not found. Type `.new` to join." });
                }
                state.vHubId = user.vHubId;
                state.step = 2.5;
                return sock.sendMessage(remoteJid, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ᴀᴜᴛʜ* ✿ ━━━━━┓\n┃\n┃ ✨ *ᴡᴇʟᴄᴏᴍᴇ,* ${user.name}\n┃ 🆔 *ɪᴅ:* ${user.vHubId}\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* How much to deposit?\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 100\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: m });
            } catch (e) { return sock.sendMessage(remoteJid, { text: "⚠️ DB Error." }); }
        }

        // --- STEP 2.5: MEMBER PATH - HANDLE AMOUNT ---
        if (state.step === 2.5) {
            if (isNaN(answer)) return sock.sendMessage(remoteJid, { text: "❌ *ᴇʀʀᴏʀ:* Enter numbers only." });
            state.amount = answer;
            state.step = 2.8;
            return sock.sendMessage(remoteJid, { 
                text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ᴘᴀʏᴍᴇɴᴛ* ✿ ━━━━━┓\n┃\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${state.amount}\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* Enter M-Pesa phone number.\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 07xxxxxxxx\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            }, { quoted: m });
        }

        // --- STEP 3 & 4: FINAL EXECUTION (STK PUSH) ---
        if (state.step === 2.8 || state.step === 3) {
            let fAmount, fPhone;
            if (state.step === 2.8) { 
                fAmount = state.amount; fPhone = answer; 
            } else { 
                const parts = answer.split(" ");
                fAmount = parts[0]; fPhone = parts[1];
            }

            if (!fAmount || !fPhone) return sock.sendMessage(remoteJid, { text: "❌ Missing details." });
            if (fPhone.startsWith('0')) fPhone = '254' + fPhone.slice(1);

            global.promptState.delete(senderPhone);
            const msg = await sock.sendMessage(remoteJid, { text: `🚀 *ᴠ-ʜᴜʙ:* Sending STK to ${fPhone}...` });

            try {
                const result = await hubClient.deposit(fPhone, fAmount, remoteJid, state.vHubId);
                if (result.success || result.ResponseCode === "0") {
                    await sock.sendMessage(remoteJid, { 
                        text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴘᴀʏ* ✿ ━━━━━┓\n┃\n┃ ✅ *sᴛᴋ sᴇɴᴛ!*\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${fAmount}\n┃ 🆔 *ᴛᴀʀɢᴇᴛ:* ${state.vHubId}\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃ 📢 Enter PIN on your phone.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                        edit: msg.key 
                    });
                    // Polling logic goes here...
                }
            } catch (err) { await sock.sendMessage(remoteJid, { text: "⚠️ Gateway Offline." }); }
        }
    }
};
