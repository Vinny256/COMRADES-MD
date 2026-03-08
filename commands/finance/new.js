const { MongoClient } = require('mongodb');
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

// Memory cache to track conversation steps
const registrationState = new Map();

module.exports = {
    name: 'new',
    category: 'finance',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0].split(':')[0];
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();

        // --- 1. START REGISTRATION ---
        if (!registrationState.has(senderPhone)) {
            registrationState.set(senderPhone, { step: 1 });
            return sock.sendMessage(from, { 
                text: "┏━━━━━ ✿ *ᴠ-ʜᴜʙ ʙᴀɴᴋɪɴɢ* ✿ ━━━━━┓\n┃\n┃ ✨ *ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴛʜᴇ ʜᴜʙ!*\n┃ _ʟᴇᴛ's ᴄʀᴇᴀᴛᴇ ʏᴏᴜʀ ᴅɪɢɪᴛᴀʟ ᴡᴀʟʟᴇᴛ._\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜᴀᴛ ᴅᴏ ʏᴏᴜ ᴡᴀɴᴛ \n┃ ᴜs ᴛᴏ ᴄᴀʟʟ ʏᴏᴜ? (ᴇ.ɢ. ᴠɪɴɴɪᴇ)\n┗━━━━━━━━━━━━━━━━━━━━━━┛" 
            }, { quoted: msg });
        }

        const state = registrationState.get(senderPhone);

        // --- 2. HANDLE NAME (Step 1 -> 2) ---
        if (state.step === 1) {
            state.name = text;
            state.step = 2;
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ʙᴀɴᴋɪɴɢ* ✿ ━━━━━┓\n┃\n┃ ✨ *ɴɪᴄᴇ ᴛᴏ ᴍᴇᴇᴛ ʏᴏᴜ,* ${text}!\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜᴀᴛ 4-ᴅɪɢɪᴛ ᴘɪɴ \n┃ ᴡᴏᴜʟᴅ ʏᴏᴜ ʟɪᴋᴇ ᴛᴏ ᴜsᴇ?\n┃\n┃ ⚠️ _ᴄᴀɴ'ᴛ sᴛᴀʀᴛ ᴡɪᴛʜ 0 ᴏʀ 1._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            }, { quoted: msg });
        }

        // --- 3. HANDLE PIN (Step 2 -> 3) ---
        if (state.step === 2) {
            const pin = text;
            if (pin.length !== 4 || isNaN(pin) || pin.startsWith('0') || pin.startsWith('1') || /^(\d)\1{3}$/.test(pin)) {
                return sock.sendMessage(from, { text: "❌ *ɪɴᴠᴀʟɪᴅ ᴘɪɴ!*\nᴍᴜsᴛ ʙᴇ 4 ᴅɪɢɪᴛs, ɴᴏᴛ sᴛᴀʀᴛɪɴɢ ᴡɪᴛʜ 0/1, ᴀɴᴅ ɴᴏ ɪᴅᴇɴᴛɪᴄᴀʟ ɴᴜᴍʙᴇʀs." });
            }
            state.pin = pin;
            state.step = 3;

            // Database Save
            try {
                await client.connect();
                const db = client.db("vinnieBot");
                const walletCol = db.collection("wallets");
                
                const total = await walletCol.countDocuments();
                const vHubId = `VH-${1001 + total}`;
                
                await walletCol.insertOne({
                    vHubId, waPhone: senderPhone, name: state.name,
                    pin: state.pin, balance: 0, createdAt: new Date()
                });

                state.vHubId = vHubId;

                return sock.sendMessage(from, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ sᴜᴄᴄᴇss* ✿ ━━━━━┓\n┃\n┃ ✅ *ᴀᴄᴄᴏᴜɴᴛ ᴄʀᴇᴀᴛᴇᴅ!*\n┃ 🆔 *ɪᴅ:* ${vHubId}\n┃ 🏦 *ʙᴀʟ:* ᴋsʜ 0\n┃\n┃ ❓ *ᴅᴇᴘᴏsɪᴛ:* ᴡᴏᴜʟᴅ ʏᴏᴜ ʟɪᴋᴇ ᴛᴏ \n┃ ᴅᴇᴘᴏsɪᴛ ꜰᴜɴᴅs ɴᴏᴡ? (ʏᴇs/ɴᴏ)\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: msg });

            } catch (e) {
                registrationState.delete(senderPhone);
                return sock.sendMessage(from, { text: "❌ *ᴇʀʀᴏʀ:* ᴅʙ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ꜰᴀɪʟᴇᴅ." });
            }
        }

        // --- 4. HANDLE DEPOSIT PROMPT (Step 3 -> End) ---
        if (state.step === 3) {
            registrationState.delete(senderPhone); // Clear state
            if (text.toLowerCase() === 'yes') {
                return sock.sendMessage(from, { text: "💰 *ᴠ-ʜᴜʙ:* ᴘʟᴇᴀsᴇ ᴛʏᴘᴇ `.prompt` ᴛᴏ sᴛᴀʀᴛ ʏᴏᴜʀ ꜰɪʀsᴛ ᴅᴇᴘᴏsɪᴛ!" });
            } else {
                return sock.sendMessage(from, { text: "👍 *ᴠ-ʜᴜʙ:* ɴᴏ ᴘʀᴏʙʟᴇᴍ! ʏᴏᴜʀ ᴡᴀʟʟᴇᴛ ɪs ʀᴇᴀᴅʏ ᴡʜᴇɴᴇᴠᴇʀ ʏᴏᴜ ɴᴇᴇᴅ ɪᴛ." });
            }
        }
    }
};
