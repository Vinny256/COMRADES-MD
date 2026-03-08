const { MongoClient } = require('mongodb');
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

// Memory cache to track conversation steps
global.registrationState = global.registrationState || new Map();

module.exports = {
    name: 'new',
    category: 'finance',
    async execute(sock, msg, args, { prefix }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0].split(':')[0];
        
        // The "Answer" is whatever comes after '.new '
        const answer = args.join(" ").trim();

        // --- STEP 1: START (.new) ---
        if (!global.registrationState.has(senderPhone)) {
            global.registrationState.set(senderPhone, { step: 1 });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓\n┃\n┃ ✨ *ᴡᴀʟʟᴇᴛ ʀᴇɢɪsᴛʀᴀᴛɪᴏɴ*\n┃ _ʟᴇᴛ's sᴇᴛ ᴜᴘ ʏᴏᴜʀ ᴀᴄᴄᴏᴜɴᴛ._\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜᴀᴛ ɪs ʏᴏᴜʀ ɴᴀᴍᴇ?\n┃\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}new YourName\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            }, { quoted: msg });
        }

        const state = global.registrationState.get(senderPhone);

        // --- STEP 2: HANDLE NAME (.new Vinnie) ---
        if (state.step === 1) {
            if (!answer) return sock.sendMessage(from, { text: `❌ *ᴇʀʀᴏʀ:* ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴀᴍᴇ.\n\nExample: \`${prefix}new Vinnie\`` });
            
            state.name = answer;
            state.step = 2;
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ʙᴀɴᴋɪɴɢ* ✿ ━━━━━┓\n┃\n┃ ✨ *ʜᴇʟʟᴏ,* ${state.name}!\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴄʜᴏᴏsᴇ ᴀ 4-ᴅɪɢɪᴛ ᴘɪɴ.\n┃\n┃ ⚠️ _ᴄᴀɴ'ᴛ sᴛᴀʀᴛ ᴡɪᴛʜ 0 ᴏʀ 1._\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}new 2580\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            }, { quoted: msg });
        }

        // --- STEP 3: HANDLE PIN (.new 2580) ---
        if (state.step === 2) {
            const pin = answer;
            if (pin.length !== 4 || isNaN(pin) || pin.startsWith('0') || pin.startsWith('1') || /^(\d)\1{3}$/.test(pin)) {
                return sock.sendMessage(from, { text: `❌ *ɪɴᴠᴀʟɪᴅ ᴘɪɴ!*\n\nMust be 4 digits (no 0/1 start).\nExample: \`${prefix}new 2580\`` });
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
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ sᴜᴄᴄᴇss* ✿ ━━━━━┓\n┃\n┃ ✅ *ᴀᴄᴄᴏᴜɴᴛ ᴄʀᴇᴀᴛᴇᴅ!*\n┃ 🆔 *ɪᴅ:* ${vHubId}\n┃ 🏦 *ʙᴀʟ:* ᴋsʜ 0\n┃\n┃ ❓ *ᴅᴇᴘᴏsɪᴛ:* ᴅᴏ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ \n┃ ᴅᴇᴘᴏsɪᴛ ɴᴏᴡ? (ʏᴇs/ɴᴏ)\n┃\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}new yes\` ᴏʀ \`${prefix}new no\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: msg });

            } catch (e) {
                global.registrationState.delete(senderPhone);
                return sock.sendMessage(from, { text: "❌ *ᴅʙ ᴇʀʀᴏʀ:* ᴄᴏᴜʟᴅ ɴᴏᴛ sᴀᴠᴇ ᴀᴄᴄᴏᴜɴᴛ." });
            }
        }

        // --- STEP 4: HANDLE DEPOSIT (.new yes) ---
        if (state.step === 3) {
            global.registrationState.delete(senderPhone); // Finish
            if (answer.toLowerCase() === 'yes') {
                return sock.sendMessage(from, { text: `💰 *ᴠ-ʜᴜʙ:* ᴛʏᴘᴇ \`${prefix}prompt\` ᴛᴏ ʙᴇɢɪɴ!` });
            } else {
                return sock.sendMessage(from, { text: "🤝 *ᴠ-ʜᴜʙ:* ᴀᴄᴄᴏᴜɴᴛ sᴀᴠᴇᴅ. sᴇᴇ ʏᴏᴜ sᴏᴏɴ!" });
            }
        }
    }
};
