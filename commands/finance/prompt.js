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

        // --- STEP 1: INITIAL GATEWAY ---
        if (!global.promptState.has(senderPhone) && args.length === 0) {
            const menu = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ꜰɪɴᴀɴᴄᴇ* ✿ ━━━━━┓\n┃\n┃ 🏦 *ᴅᴇᴘᴏsɪᴛ ᴛᴏ ᴡᴀʟʟᴇᴛ*\n┃\n┃ 🔑 *ʀᴇᴘʟʏ:* \`${prefix}prompt <ʏᴏᴜʀ-ɪᴅ>\`\n┃ 👤 *ɢᴜᴇsᴛ:* \`${prefix}prompt guest\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            return sock.sendMessage(remoteJid, { text: menu }, { quoted: m });
        }

        // --- STEP 2: HANDLE GUEST BYPASS ---
        if (!global.promptState.has(senderPhone) && answer.toLowerCase() === 'guest') {
            global.promptState.set(senderPhone, { step: 3, vHubId: "GUEST" });
            return sock.sendMessage(remoteJid, { text: "👤 *ᴠ-ʜᴜʙ:* Guest Mode. Reply with `.prompt <amount> <phone>`" });
        }

        // --- STEP 3: IDENTIFY MEMBER & FETCH DATA ---
        if (!global.promptState.has(senderPhone)) {
            const vHubId = answer.toUpperCase().startsWith('VH-') ? answer.toUpperCase() : `VH-${answer}`;
            
            try {
                await client.connect();
                const user = await client.db("vinnieBot").collection("wallets").findOne({ vHubId });

                if (!user) {
                    return sock.sendMessage(remoteJid, { text: "❌ *ᴇʀʀᴏʀ:* Wallet ID not found. Use `.new` to create one." });
                }

                global.promptState.set(senderPhone, { 
                    step: 2, 
                    vHubId: user.vHubId, 
                    savedPhone: user.waPhone, // THIS IS THE REAL PHONE FROM DB
                    name: user.name 
                });

                return sock.sendMessage(remoteJid, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ᴀᴜᴛʜ* ✿ ━━━━━┓\n┃\n┃ ✨ *ᴡᴇʟᴄᴏᴍᴇ,* ${user.name}\n┃ 📱 *ᴘᴀʏɪɴɢ ᴡɪᴛʜ:* ${user.waPhone}\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ʜᴏᴡ ᴍᴜᴄʜ ᴛᴏ ᴅᴇᴘᴏsɪᴛ?\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt <amount>\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: m });

            } catch (e) {
                return sock.sendMessage(remoteJid, { text: "⚠️ *ᴅʙ ᴇʀʀᴏʀ:* Could not fetch wallet." });
            }
        }

        const state = global.promptState.get(senderPhone);

        // --- STEP 4: EXECUTE DEPOSIT ---
        if (state.step === 2 || state.step === 3) {
            let amount, phone;

            if (state.step === 2) { // MEMBER PATH
                amount = answer;
                phone = state.savedPhone; // Use the number from the database!
            } else { // GUEST PATH
                [amount, phone] = answer.split(" ");
                if (phone && phone.startsWith('0')) phone = '254' + phone.slice(1);
            }

            if (!amount || isNaN(amount)) {
                return sock.sendMessage(remoteJid, { text: "❌ *ɪɴᴘᴜᴛ ᴇʀʀᴏʀ:* Please enter a valid amount." });
            }

            global.promptState.delete(senderPhone);
            const msg = await sock.sendMessage(remoteJid, { text: `🚀 *ᴠ-ʜᴜʙ:* Initiating deposit for ${state.vHubId}...` });

            try {
                const result = await hubClient.deposit(phone, amount, remoteJid, state.vHubId);
                if (result.success || result.ResponseCode === "0") {
                    await sock.sendMessage(remoteJid, { 
                        text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴘᴀʏ* ✿ ━━━━━┓\n┃\n┃ ✅ *sᴛᴋ sᴇɴᴛ ᴛᴏ ${phone}*\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${amount}\n┃ 🆔 *ᴛᴀʀɢᴇᴛ:* ${state.vHubId}\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃ 📢 ᴇɴᴛᴇʀ ᴘɪɴ ᴏɴ ʏᴏᴜʀ ᴘʜᴏɴᴇ.\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                        edit: msg.key 
                    });
                    
                    // POLLING ENGINE (Omitted for brevity, keep your existing one here)
                } else {
                    await sock.sendMessage(remoteJid, { text: "❌ *ᴍ-ᴘᴇsᴀ ᴇʀʀᴏʀ:* STK Push failed.", edit: msg.key });
                }
            } catch (err) {
                await sock.sendMessage(remoteJid, { text: "⚠️ *ᴠ-ʜᴜʙ:* Gateway Offline.", edit: msg.key });
            }
        }
    }
};
