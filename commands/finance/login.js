import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

// Memory cache to track login steps
global.loginState = global.loginState || new Map();

const loginCommand = {
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
            
            let step1Msg = `┌────────────────────────┈\n`;
            step1Msg += `│      *ᴠ-ʜᴜʙ_ʙᴀɴᴋɪɴɢ* \n`;
            step1Msg += `└────────────────────────┈\n\n`;
            step1Msg += `┌─『 ᴀᴄᴄᴏᴜɴᴛ_ᴀᴄᴄᴇss 』\n`;
            step1Msg += `│ ⚙ *sᴛᴀᴛᴜs:* ʟᴏɢɪɴ_ʀᴇǫᴜɪʀᴇᴅ\n`;
            step1Msg += `│ ⚙ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜᴀᴛ ɪs ʏᴏᴜʀ ᴠ-ʜᴜʙ ɪᴅ?\n`;
            step1Msg += `└────────────────────────┈\n\n`;
            step1Msg += `◈ *ʀᴇᴘʟʏ:* ${prefix}ʟᴏɢɪɴ ᴠʜ-𝟷𝟶𝟶𝟷`;
            
            return sock.sendMessage(from, { text: step1Msg }, { quoted: msg });
        }

        const state = global.loginState.get(senderPhone);

        // --- STEP 2: VERIFY ID/NAME & ASK PIN ---
        if (state.step === 1) {
            const formattedId = (!isNaN(answer) && answer.length > 0) ? `VH-${answer.toUpperCase()}` : answer.toUpperCase();
            const searchId = answer.toUpperCase().startsWith('VH-') ? answer.toUpperCase() : formattedId;
            
            try {
                await client.connect();
                const db = client.db("vinnieBot");
                
                const user = await db.collection("users").findOne({ 
                    $or: [
                        { v_hub_id: searchId },
                        { name: new RegExp(`^${answer}$`, 'i') } 
                    ]
                });

                if (!user) {
                    global.loginState.delete(senderPhone);
                    return sock.sendMessage(from, { text: "┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ᴀᴄᴄᴏᴜɴᴛ ɴᴏᴛ ғᴏᴜɴᴅ.\n│ ⚙ ᴄʀᴇᴀᴛᴇ ᴏɴᴇ ᴡɪᴛʜ: .ɴᴇᴡ\n└────────────────────────┈" });
                }

                state.vHubId = user.v_hub_id;
                state.name = user.name;
                state.step = 2;

                let step2Msg = `┌────────────────────────┈\n`;
                step2Msg += `│      *ᴠ-ʜᴜʙ_sᴇᴄᴜʀɪᴛʏ* \n`;
                step2Msg += `└────────────────────────┈\n\n`;
                step2Msg += `┌─『 ɪᴅᴇɴᴛɪᴛʏ_ᴄᴏɴғɪʀᴍᴇᴅ 』\n`;
                step2Msg += `│ 👤 *ᴜsᴇʀ:* ${user.name}\n`;
                step2Msg += `│ 🆔 *ɪᴅ:* ${user.v_hub_id}\n`;
                step2Msg += `│ ⚙ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ 𝟺-ᴅɪɢɪᴛ ᴘɪɴ.\n`;
                step2Msg += `└────────────────────────┈\n\n`;
                step2Msg += `◈ *ʀᴇᴘʟʏ:* ${prefix}ʟᴏɢɪɴ [ᴘɪɴ]`;

                return sock.sendMessage(from, { text: step2Msg }, { quoted: msg });
            } catch (e) {
                global.loginState.delete(senderPhone);
                return sock.sendMessage(from, { text: "┌─『 ᴅʙ_ᴇʀʀᴏʀ 』\n│ ⚙ sʏsᴛᴇᴍ ᴏғғʟɪɴᴇ.\n└────────────────────────┈" });
            }
        }

        // --- STEP 3: VERIFY PIN & SHOW DASHBOARD ---
        if (state.step === 2) {
            try {
                const db = client.db("vinnieBot");
                const user = await db.collection("users").findOne({ v_hub_id: state.vHubId });
                const wallet = await db.collection("wallets").findOne({ vHubId: state.vHubId });

                if (wallet.pin !== answer) {
                    return sock.sendMessage(from, { text: "┌─『 sᴇᴄᴜʀɪᴛʏ_ᴀʟᴇʀᴛ 』\n│ ⚠️ ᴡʀᴏɴɢ ᴘɪɴ. ᴛʀʏ ᴀɢᴀɪɴ.\n└────────────────────────┈" });
                }

                global.loginState.delete(senderPhone);

                let dashboard = `┌────────────────────────┈\n`;
                dashboard += `│      *ᴠ-ʜᴜʙ_ᴅᴀsʜʙᴏᴀʀᴅ* \n`;
                dashboard += `└────────────────────────┈\n\n`;
                dashboard += `┌─『 ᴀᴄᴄᴏᴜɴᴛ_sᴜᴍᴍᴀʀʏ 』\n`;
                dashboard += `│ ✨ *ᴡᴇʟᴄᴏᴍᴇ,* ${user.name}\n`;
                dashboard += `│ 🆔 *ɪᴅ:* ${user.v_hub_id}\n`;
                dashboard += `│ 🏦 *ʙᴀʟᴀɴᴄᴇ:* ᴋsʜ ${user.balance}\n`;
                dashboard += `└────────────────────────┈\n\n`;
                dashboard += `┌─『 ғɪɴᴀɴᴄᴇ_ᴍᴇɴᴜ 』\n`;
                dashboard += `│ ├─◈ ${prefix}ᴅᴇᴘᴏsɪᴛ\n`;
                dashboard += `│ ├─◈ ${prefix}ᴡɪᴛʜᴅʀᴀᴡ\n`;
                dashboard += `│ ├─◈ ${prefix}ᴛʀᴀɴsғᴇʀ\n`;
                dashboard += `│ ├─◈ ${prefix}sᴛᴀᴛᴇᴍᴇɴᴛ\n`;
                dashboard += `│ ╰─◈ ${prefix}ᴄʟᴏsᴇ\n`;
                dashboard += `└────────────────────────┈\n\n`;
                dashboard += `_⚠️ sᴇssɪᴏɴ ᴇxᴘɪʀᴇs ɪɴ 𝟷𝟾𝟶s_`;

                const sentMsg = await sock.sendMessage(from, { text: dashboard }, { quoted: msg });

                // --- 💣 SELF-DESTRUCT ENGINE ---
                setTimeout(async () => {
                    try {
                        await sock.sendMessage(from, { delete: sentMsg.key });
                        console.log(`┃ 🗑️ SESSION_CLEANUP: Dashboard for ${user.v_hub_id} purged.`);
                    } catch (err) {
                        console.error("┃ ❌ PURGE_FAILED:", err.message);
                    }
                }, 180000); 

                return;
            } catch (e) {
                global.loginState.delete(senderPhone);
                return sock.sendMessage(from, { text: "┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ʟᴏɢɪɴ ᴘʀᴏᴄᴇss ғᴀɪʟᴇᴅ.\n└────────────────────────┈" });
            }
        }
    }
};

export default loginCommand;
