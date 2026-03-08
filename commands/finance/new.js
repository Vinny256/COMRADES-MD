const { MongoClient } = require('mongodb');
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

// Memory cache to track conversation steps
const registrationState = new Map();

module.exports = {
    name: 'new',
    category: 'finance',
    async execute(sock, msg, args, { prefix }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0].split(':')[0];
        
        // Get the full text and remove the prefix to get the "Answer"
        const fullText = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        const answer = fullText.startsWith(prefix) ? fullText.slice(prefix.length).trim() : null;

        // --- 1. INITIAL TRIGGER (.new) ---
        if (!registrationState.has(senderPhone)) {
            registrationState.set(senderPhone, { step: 1 });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓\n┃\n┃ ✨ *ᴡᴀʟʟᴇᴛ ʀᴇɢɪsᴛʀᴀᴛɪᴏɴ*\n┃ _ʟᴇᴛ's sᴇᴛ ᴜᴘ ʏᴏᴜʀ ᴀᴄᴄᴏᴜɴᴛ._\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜᴀᴛ ɪs ʏᴏᴜʀ ɴᴀᴍᴇ?\n┃\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}YourName\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            }, { quoted: msg });
        }

        const state = registrationState.get(senderPhone);

        // --- 2. HANDLE NAME (.Name) ---
        if (state.step === 1) {
            if (!answer || answer.toLowerCase() === 'new') return; // Ignore if they just re-typed .new
            
            state.name = answer;
            state.step = 2;
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ʙᴀɴᴋɪɴɢ* ✿ ━━━━━┓\n┃\n┃ ✨ *ʜᴇʟʟᴏ,* ${state.name}!\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴄʜᴏᴏsᴇ ᴀ 4-ᴅɪɢɪᴛ ᴘɪɴ.\n┃\n┃ ⚠️ _ᴄᴀɴ'ᴛ sᴛᴀʀᴛ ᴡɪᴛʜ 0 ᴏʀ 1._\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}1234\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            }, { quoted: msg });
        }

        // --- 3. HANDLE PIN (.PIN) ---
        if (state.step === 2) {
            const pin = answer;
            if (!pin || pin.length !== 4 || isNaN(pin) || pin.startsWith('0') || pin.startsWith('1') || /^(\d)\1{3}$/.test(pin)) {
                return sock.sendMessage(from, { text: `❌ *ɪɴᴠᴀʟɪᴅ ᴘɪɴ!*\n\nMust be 4 digits, not starting with 0/1.\nExample: \`${prefix}2580\`` });
            }
            
            state.pin = pin;
            state.step = 3;

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

                return sock.sendMessage(from, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ sᴜᴄᴄᴇss* ✿ ━━━━━┓\n┃\n┃ ✅ *ᴀᴄᴄᴏᴜɴᴛ ᴄʀᴇᴀᴛᴇᴅ!*\n┃ 🆔 *ɪᴅ:* ${vHubId}\n┃ 🏦 *ʙᴀʟ:* ᴋsʜ 0\n┃\n┃ ❓ *ᴅᴇᴘᴏsɪᴛ:* ᴅᴏ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ \n┃ ᴅᴇᴘᴏsɪᴛ ɴᴏᴡ? (ʏᴇs/ɴᴏ)\n┃\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}yes\` ᴏʀ \`${prefix}no\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: msg });

            } catch (e) {
                registrationState.delete(senderPhone);
                return sock.sendMessage(from, { text: "❌ *ᴅʙ ᴇʀʀᴏʀ:* ᴄᴏᴜʟᴅ ɴᴏᴛ sᴀᴠᴇ ᴀᴄᴄᴏᴜɴᴛ." });
            }
        }

        // --- 4. HANDLE DEPOSIT (.yes/.no) ---
        if (state.step === 3) {
            registrationState.delete(senderPhone);
            if (answer?.toLowerCase() === 'yes') {
                return sock.sendMessage(from, { text: `💰 *ᴠ-ʜᴜʙ:* ᴛʏᴘᴇ \`${prefix}prompt\` ᴛᴏ ʙᴇɢɪɴ!` });
            } else {
                return sock.sendMessage(from, { text: "🤝 *ᴠ-ʜᴜʙ:* ᴀᴄᴄᴏᴜɴᴛ sᴀᴠᴇᴅ. sᴇᴇ ʏᴏᴜ sᴏᴏɴ!" });
            }
        }
    }
};
