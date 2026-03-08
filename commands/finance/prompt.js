const { MongoClient } = require('mongodb');
const hubClient = require('../../utils/hubClient');
const axios = require('axios');

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);
global.promptState = global.promptState || new Map();

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(sock, msg, args, { prefix }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0];
        const answer = args.join(" ").trim();

        // --- HELPER: AIRTEL BLOCKER ---
        const isAirtel = (num) => /^(254|0)(73|75|78|10|11)/.test(num.replace(/\D/g, ''));

        // --- STEP 1: INITIAL GATEWAY ---
        if (!global.promptState.has(senderPhone)) {
            // Check for Guest Long Command: .prompt 10 07xxxxxxxx
            if (args.length >= 2) {
                const [amt, ph] = args;
                if (isAirtel(ph)) return sock.sendMessage(from, { text: "❌ *ᴀɪʀᴛᴇʟ ɴᴏᴛ sᴜᴘᴘᴏʀᴛᴇᴅ*\n\nʀᴇǫᴜᴇsᴛ ᴄᴏᴜʟᴅɴ'ᴛ ᴘʀᴏᴄᴇᴇᴅ ꜰᴏʀ ᴀɴ ᴀɪʀᴛᴇʟ ᴍᴏɴᴇʏ ɴᴜᴍʙᴇʀ. ᴅᴇᴘᴏsɪᴛ ꜰᴏʀ ᴛʜᴇᴍ ᴄᴏᴍɪɴɢ sᴏᴏɴ!" });
                
                let finalPh = ph.startsWith('0') ? '254' + ph.slice(1) : ph;
                global.promptState.set(senderPhone, { step: 'EXECUTING', vHubId: "GUEST", amount: amt, phone: finalPh });
                return this.triggerPush(sock, from, senderPhone);
            }

            global.promptState.set(senderPhone, { step: 1 });
            const menu = `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓
┃
┃ 🏦 *ᴠ-ʜᴜʙ ꜰɪɴᴀɴᴄᴇ ɢᴀᴛᴇᴡᴀʏ*
┃ _sᴇᴄᴜʀᴇ ᴅɪɢɪᴛᴀʟ ʙᴀɴᴋɪɴɢ_
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🆕 *[ ${prefix}new ]* ┃ _ᴄʀᴇᴀᴛᴇ ᴡᴀʟʟᴇᴛ_
┃
┃ 🔑 *[ ${prefix}prompt id ]* ┃ _ᴍᴇᴍʙᴇʀ ʟᴏɢɪɴ_
┃
┃ 👤 *[ ${prefix}prompt guest ]* ┃ _ǫᴜɪᴄᴋ ᴅᴇᴘᴏsɪᴛ_
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 💡 *ᴛɪᴘ:* ᴛʏᴘᴇ ᴀ ᴄᴏᴍᴍᴀɴᴅ ᴛᴏ ʙᴇɢɪɴ.
┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            return await sock.sendMessage(from, { text: menu });
        }

        const state = global.promptState.get(senderPhone);

        // --- STEP 2: MEMBER ID VERIFICATION ---
        if (state.step === 1) {
            if (answer.toLowerCase() === 'guest') {
                state.step = 3; state.vHubId = "GUEST";
                return sock.sendMessage(from, { text: "👤 *ᴠ-ʜᴜʙ ɢᴜᴇsᴛ:*\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ <ᴀᴍᴏᴜɴᴛ> <ᴘʜᴏɴᴇ>\n💡 *ʀᴇᴘʟʏ:* \`.prompt 10 07xxxxxxxx\`" });
            }

            const vHubId = answer.toUpperCase().startsWith('VH-') ? answer.toUpperCase() : `VH-${answer.toUpperCase()}`;
            try {
                await client.connect();
                const user = await client.db("vinnieBot").collection("wallets").findOne({ vHubId });
                if (!user) {
                    global.promptState.delete(senderPhone);
                    return sock.sendMessage(from, { text: "⚠️ *ɪɴᴠᴀʟɪᴅ ɪᴅ:* ᴀʀᴇ ʏᴏᴜ ᴛʀʏɪɴɢ ᴛᴏ ᴅᴇᴘᴏsɪᴛ ᴀs ᴀ ɢᴜᴇsᴛ? ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ᴡᴀʟʟᴇᴛ ɴᴜᴍʙᴇʀ." });
                }
                state.vHubId = user.vHubId; state.name = user.name; state.step = 2;
                return sock.sendMessage(from, { text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ᴀᴜᴛʜ* ✿ ━━━━━┓\n┃\n┃ ✨ *ᴡᴇʟᴄᴏᴍᴇ,* ${user.name}!\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ʜᴏᴡ ᴍᴜᴄʜ ᴅᴏ ʏᴏᴜ \n┃ ᴡᴀɴᴛ ᴛᴏ ᴅᴇᴘᴏsɪᴛ?\n┃\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 50\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` });
            } catch (e) { return sock.sendMessage(from, { text: "⚠️ *ᴅʙ ᴏꜰꜰʟɪɴᴇ*" }); }
        }

        // --- STEP 3: AMOUNT -> ASK PHONE ---
        if (state.step === 2) {
            if (isNaN(answer)) return sock.sendMessage(from, { text: "❌ *ᴇʀʀᴏʀ:* ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ᴀᴍᴏᴜɴᴛ." });
            state.amount = answer; state.step = 4;
            return sock.sendMessage(from, { text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ᴘᴀʏᴍᴇɴᴛ* ✿ ━━━━━┓\n┃\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${state.amount}\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ ᴍ-ᴘᴇsᴀ ɴᴜᴍʙᴇʀ \n┃ ᴛᴏ ʙᴇ ᴘʀᴏᴍᴘᴛᴇᴅ.\n┃\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 07xxxxxxxx\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` });
        }

        // --- STEP 4: FINAL VALIDATION & PUSH ---
        if (state.step === 3 || state.step === 4) {
            let amt, ph;
            if (state.step === 3) { [amt, ph] = answer.split(" "); } else { amt = state.amount; ph = answer; }

            if (isAirtel(ph)) return sock.sendMessage(from, { text: "❌ *ᴀɪʀᴛᴇʟ ɴᴏᴛ sᴜᴘᴘᴏʀᴛᴇᴅ*" });
            state.amount = amt; state.phone = ph.startsWith('0') ? '254' + ph.slice(1) : ph;
            state.step = 'EXECUTING';
            return this.triggerPush(sock, from, senderPhone);
        }
    },

    async triggerPush(sock, from, senderPhone) {
        const state = global.promptState.get(senderPhone);
        const waitMsg = await sock.sendMessage(from, { text: `🚀 *ᴠ-ʜᴜʙ:* ɪɴɪᴛɪᴀᴛɪɴɢ sᴇᴄᴜʀᴇ sᴛᴋ ᴘᴜsʜ ꜰᴏʀ ${state.vHubId}...` });

        try {
            const res = await hubClient.deposit(state.phone, state.amount, from, state.vHubId);
            if (res.success || res.ResponseCode === "0") {
                await sock.sendMessage(from, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴘᴀʏ* ✿ ━━━━━┓\n┃\n┃ ✅ *sᴛᴋ ᴘᴜsʜ sᴇɴᴛ!*\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${state.amount}\n┃ 🆔 *ʀᴇꜰᴇʀᴇɴᴄᴇ:* ${state.vHubId}\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃\n┃ 📢 *ᴀᴄᴛɪᴏɴ ʀᴇǫᴜɪʀᴇᴅ:*\n┃ ᴇɴᴛᴇʀ ᴍ-ᴘᴇsᴀ ᴘɪɴ ᴏɴ ʏᴏᴜʀ ᴘʜᴏɴᴇ.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                    edit: waitMsg.key
                });

                

                // --- SMART POLLING FOR THE SUCCESS RECEIPT ---
                let attempts = 0;
                const checkInterval = setInterval(async () => {
                    attempts++;
                    try {
                        const PROXY_URL = "https://vhubg-27494ea43fc4.herokuapp.com";
                        const check = await axios.get(`${PROXY_URL}/api/check-status?phone=${state.phone}`);
                        
                        if (check.data.status === "OK" && check.data.isRecent) {
                            clearInterval(checkInterval);
                            global.promptState.delete(senderPhone);
                            const tx = check.data.lastTransaction;
                            
                            const receipt = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ʀᴇᴄᴇɪᴘᴛ* ✿ ━━━━━┓
┃
┃ ✅ *ᴅᴇᴘᴏsɪᴛ sᴜᴄᴄᴇssꜰᴜʟ*
┃ 👤 *ᴄᴜsᴛᴏᴍᴇʀ:* ${state.name || 'Guest User'}
┃ 💵 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${tx.amount}
┃ 📅 *ᴛɪᴍᴇ:* ${new Date().toLocaleTimeString()}
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🏦 *ᴠ-ʜᴜʙ ʙᴀʟ:* ᴋsʜ ${check.data.balance}
┃ 🧾 *ᴠ-ʜᴜʙ ʀᴇꜰ:* ${Math.random().toString(36).substring(2, 10).toUpperCase()}
┃ 📱 *ᴍ-ᴘᴇsᴀ ʀᴇꜰ:* ${tx.receipt}
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ _ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ʙᴀɴᴋɪɴɢ ᴡɪᴛʜ ᴜs_
┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                            return await sock.sendMessage(from, { text: receipt });
                        }
                    } catch (e) { if (attempts >= 6) clearInterval(checkInterval); }
                }, 10000);
            }
        } catch (e) { global.promptState.delete(senderPhone); }
    }
};
