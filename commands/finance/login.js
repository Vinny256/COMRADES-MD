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

        // --- STEP 2: VERIFY ID/NAME & ASK PIN ---
        if (state.step === 1) {
            // Cleverly format ID if it's just a number
            const formattedId = (!isNaN(answer) && answer.length > 0) ? `VH-${answer.toUpperCase()}` : answer.toUpperCase();
            const searchId = answer.toUpperCase().startsWith('VH-') ? answer.toUpperCase() : formattedId;
            
            try {
                await client.connect();
                const db = client.db("vinnieBot");
                
                // --- 🔍 SMART SEARCH: Find by VH-ID OR by Name ---
                const user = await db.collection("users").findOne({ 
                    $or: [
                        { v_hub_id: searchId },
                        { name: new RegExp(`^${answer}$`, 'i') } 
                    ]
                });

                if (!user) {
                    global.loginState.delete(senderPhone);
                    return sock.sendMessage(from, { text: "❌ *ᴀᴄᴄᴏᴜɴᴛ ɴᴏᴛ ꜰᴏᴜɴᴅ:* ᴘʟᴇᴀsᴇ ᴄʀᴇᴀᴛᴇ ᴏɴᴇ ᴡɪᴛʜ `.new`" });
                }

                state.vHubId = user.v_hub_id;
                state.name = user.name;
                state.step = 2;
                return sock.sendMessage(from, { 
                    text: `┏━━━━━ ✿ *ᴠ-ʜᴜʙ sᴇᴄᴜʀɪᴛʏ* ✿ ━━━━━┓\n┃\n┃ 👤 *ᴜsᴇʀ:* ${user.name}\n┃ 🆔 *ɪᴅ:* ${user.v_hub_id}\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ ʏᴏᴜʀ 4-ᴅɪɢɪᴛ ᴘɪɴ.\n┃\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}login 2580\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                }, { quoted: msg });
            } catch (e) {
                global.loginState.delete(senderPhone);
                return sock.sendMessage(from, { text: "❌ *sʏsᴛᴇᴍ ᴇʀʀᴏʀ:* ᴅʙ ᴏꜰꜰʟɪɴᴇ." });
            }
        }

        // --- STEP 3: VERIFY PIN & SHOW DASHBOARD (WITH SELF-DESTRUCT) ---
        if (state.step === 2) {
            try {
                const db = client.db("vinnieBot");
                const user = await db.collection("users").findOne({ v_hub_id: state.vHubId });

                // Use the PIN from the wallet registration
                const wallet = await db.collection("wallets").findOne({ vHubId: state.vHubId });

                if (wallet.pin !== answer) {
                    return sock.sendMessage(from, { text: "⚠️ *ᴡʀᴏɴɢ ᴘɪɴ:* ᴛʀʏ ᴀɢᴀɪɴ ᴡɪᴛʜ `.login <PIN>`" });
                }

                global.loginState.delete(senderPhone);

                const bankingMenu = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ ᴅᴀsʜʙᴏᴀʀᴅ* ✿ ━━━━━┓
┃
┃ ✨ *ᴡᴇʟᴄᴏᴍᴇ ʙᴀᴄᴋ,* ${user.name}!
┃ 🆔 *ᴀᴄᴄᴏᴜɴᴛ:* ${user.v_hub_id}
┃ 🏦 *ʙᴀʟᴀɴᴄᴇ:* ᴋsʜ ${user.balance}
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 📥 *[ ${prefix}prompt ]* ┃ _ᴅᴇᴘᴏsɪᴛ ꜰᴜɴᴅs_
┃
┃ 💸 *[ ${prefix}withdraw ]* ┃ _ᴡɪᴛʜᴅʀᴀᴡ ᴄᴀsʜ_
┃
┃ 🔄 *[ ${prefix}transfer ]* ┃ _sᴇɴᴅ ᴛᴏ ᴠ-ʜᴜʙ_
┃
┃ 📜 *[ ${prefix}statement ]* ┃ _ʟᴀsᴛ 𝟓 ᴛx_
┃
┃ 🔐 *[ ${prefix}changepin ]* ┃ _ᴜᴘᴅᴀᴛᴇ sᴇᴄᴜʀɪᴛʏ_
┃
┃ 🗑️ *[ ${prefix}close ]* ┃ _ᴄʟᴏsᴇ sᴇssɪᴏɴ_
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ ⚠️ *sᴇᴄᴜʀɪᴛʏ:* ᴛʜɪs ᴍᴇɴᴜ ᴡɪʟʟ sᴇʟꜰ-ᴅᴇsᴛʀᴜᴄᴛ
┃ ɪɴ 𝟑 ᴍɪɴᴜᴛᴇs ꜰᴏʀ ʏᴏᴜʀ ᴘʀɪᴠᴀᴄʏ.
┃
┃ © 2026 | ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                const sentMsg = await sock.sendMessage(from, { text: bankingMenu }, { quoted: msg });

                // --- 💣 SELF-DESTRUCT ENGINE 💣 ---
                setTimeout(async () => {
                    try {
                        await sock.sendMessage(from, { delete: sentMsg.key });
                        console.log(`┃ 🗑️ SESSION_CLEANUP: Dashboard for ${user.v_hub_id} deleted.`);
                    } catch (err) {
                        console.error("┃ ❌ DELETE_FAILED:", err.message);
                    }
                }, 180000); // 180,000ms = 3 Minutes

                return;

            } catch (e) {
                global.loginState.delete(senderPhone);
                return sock.sendMessage(from, { text: "❌ *ʟᴏɢɪɴ ꜰᴀɪʟᴇᴅ:* ᴅʙ ᴇʀʀᴏʀ." });
            }
        }
    }
};
