const { MongoClient } = require('mongodb');
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

// Memory cache to track login steps
global.loginState = global.loginState || new Map();

module.exports = {
    name: 'login',
    category: 'finance',
    async execute(sock, msg, args, { prefix }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0].split(':')[0];
        const answer = args.join(" ").trim();

        // --- STEP 1: INITIAL TRIGGER (.login) ---
        if (!global.loginState.has(senderPhone)) {
            global.loginState.set(senderPhone, { step: 1 });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓\n┃\n┃ 🏦 *ᴠ-ʜᴜʙ ʙᴀɴᴋɪɴɢ ʟᴏɢɪɴ*\n┃ _ᴇɴᴛᴇʀ ʏᴏᴜʀ ᴄʀᴇᴅᴇɴᴛɪᴀʟs._\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜᴀᴛ ɪs ʏᴏᴜʀ ᴠ-ʜᴜʙ ɪᴅ?\n┃\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}login VH-1001\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            }, { quoted: msg });
        }

        const state = global.loginState.get(senderPhone);

        // --- STEP 2: VERIFY ID & ASK PIN ---
        if (state.step === 1) {
            if (!answer.startsWith('VH-')) {
                return sock.sendMessage(from, { text: "❌ *ɪɴᴠᴀʟɪᴅ ɪᴅ:* ᴍᴜsᴛ sᴛᴀʀᴛ ᴡɪᴛʜ `VH-`" });
            }

            try {
                await client.connect();
                const db = client.db("vinnieBot");
                const user = await db.collection("wallets").findOne({ vHubId: answer.toUpperCase() });

                if (!user) {
                    global.loginState.delete(senderPhone);
                    return sock.sendMessage(from, { text: "❌ *ᴀᴄᴄᴏᴜɴᴛ ɴᴏᴛ ꜰᴏᴜɴᴅ:* ᴘʟᴇᴀsᴇ ᴄʀᴇᴀᴛᴇ ᴏɴᴇ ᴡɪᴛʜ `.new`" });
                }

                state.vHubId = user.vHubId;
                state.step = 2;
                return sock.sendMessage(from, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ sᴇᴄᴜʀɪᴛʏ* ✿ ━━━━━┓\n┃\n┃ 👤 *ᴜsᴇʀ:* ${user.name}\n┃ 🆔 *ɪᴅ:* ${user.vHubId}\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ ʏᴏᴜʀ 4-ᴅɪɢɪᴛ ᴘɪɴ.\n┃\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}login 2580\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: msg });
            } catch (e) {
                global.loginState.delete(senderPhone);
                return sock.sendMessage(from, { text: "❌ *sʏsᴛᴇᴍ ᴇʀʀᴏʀ:* ᴅʙ ᴏꜰꜰʟɪɴᴇ." });
            }
        }

        // --- STEP 3: VERIFY PIN & SHOW DASHBOARD ---
        if (state.step === 2) {
            try {
                const db = client.db("vinnieBot");
                const user = await db.collection("wallets").findOne({ vHubId: state.vHubId });

                if (user.pin !== answer) {
                    return sock.sendMessage(from, { text: "⚠️ *ᴡʀᴏɴɢ ᴘɪɴ:* ᴛʀʏ ᴀɢᴀɪɴ ᴡɪᴛʜ `.login <PIN>`" });
                }

                // LOGIN SUCCESS - CLEAR STATE & SHOW MENU
                global.loginState.delete(senderPhone);

                const bankingMenu = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ᴅᴀsʜʙᴏᴀʀᴅ* ✿ ━━━━━┓
┃
┃ ✨ *ᴡᴇʟᴄᴏᴍᴇ ʙᴀᴄᴋ,* ${user.name}!
┃ 🆔 *ᴀᴄᴄᴏᴜɴᴛ:* ${user.vHubId}
┃ 🏦 *ʙᴀʟᴀɴᴄᴇ:* ᴋsʜ ${user.balance}
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 💸 *[ .pay ]* ┃ _ᴡɪᴛʜᴅʀᴀᴡ ᴛᴏ ᴍ-ᴘᴇsᴀ_
┃
┃ 🔄 *[ .transfer ]* ┃ _sᴇɴᴅ ᴛᴏ ᴠ-ʜᴜʙ ɪᴅ_
┃
┃ 📥 *[ .prompt ]* ┃ _ᴅᴇᴘᴏsɪᴛ ᴍᴏɴᴇʏ_
┃
┃ 📜 *[ .history ]* ┃ _ᴠɪᴇᴡ ᴛʀᴀɴsᴀᴄᴛɪᴏɴs_
┃
┃ 🗑️ *[ .delete ]* ┃ _ᴄʟᴏsᴇ ᴀᴄᴄᴏᴜɴᴛ_
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ © 2026 | ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                return sock.sendMessage(from, { text: bankingMenu }, { quoted: msg });

            } catch (e) {
                global.loginState.delete(senderPhone);
                return sock.sendMessage(from, { text: "❌ *ʟᴏɢɪɴ ꜰᴀɪʟᴇᴅ:* ᴅʙ ᴇʀʀᴏʀ." });
            }
        }
    }
};
