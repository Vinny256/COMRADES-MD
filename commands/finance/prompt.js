import { MongoClient } from 'mongodb';
import hubClient from '../../utils/hubClient.js';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
global.promptState = global.promptState || new Map();

const promptCommand = {
    name: 'prompt',
    category: 'finance',
    async execute(sock, msg, args, { prefix }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0];
        const answer = args.join(" ").trim();

        // --- HELPER: AIRTEL BLOCKER ---
        const isAirtel = (num) => /^(254|0)(73|75|78|10|11)/.test(num.replace(/\D/g, ''));

        // --- SESSION CLOSER ---
        if (answer.toLowerCase() === 'close') {
            if (global.promptState.has(senderPhone)) {
                global.promptState.delete(senderPhone);
                return sock.sendMessage(from, { text: "┌─『 ᴠ-ʜᴜʙ 』\n│ ✅ sᴇssɪᴏɴ ᴄʟᴏsᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ.\n└────────────────────────┈" });
            } else {
                return sock.sendMessage(from, { text: "┌─『 ᴠ-ʜᴜʙ 』\n│ ❌ ɴᴏ ᴀᴄᴛɪᴠᴇ sᴇssɪᴏɴ ғᴏᴜɴᴅ.\n└────────────────────────┈" });
            }
        }

        // --- STEP 1: INITIAL GATEWAY ---
        if (!global.promptState.has(senderPhone)) {
            // Check for Guest Long Command: .prompt 10 07xxxxxxxx
            if (args.length >= 2) {
                const [amt, ph] = args;
                if (isAirtel(ph)) return sock.sendMessage(from, { text: "┌─『 ᴀɪʀᴛᴇʟ_ᴀʟᴇʀᴛ 』\n│ ❌ ᴀɪʀᴛᴇʟ ᴍᴏɴᴇʏ ɴᴏᴛ sᴜᴘᴘᴏʀᴛᴇᴅ.\n└────────────────────────┈" });
                
                let finalPh = ph.startsWith('0') ? '254' + ph.slice(1) : ph;
                global.promptState.set(senderPhone, { step: 'EXECUTING', vHubId: "GUEST", amount: amt, phone: finalPh });
                return this.triggerPush(sock, from, senderPhone);
            }

            global.promptState.set(senderPhone, { step: 1 });
            
            let menu = `┌────────────────────────┈\n`;
            menu += `│      *ғɪɴᴀɴᴄᴇ_ɢᴀᴛᴇᴡᴀʏ* \n`;
            menu += `└────────────────────────┈\n\n`;
            menu += `┌─『 ᴀᴄᴄᴇss_ᴍᴏᴅᴇs 』\n`;
            menu += `│ ├─◈ ${prefix}ɴᴇᴡ (ᴄʀᴇᴀᴛᴇ ᴡᴀʟʟᴇᴛ)\n`;
            menu += `│ ├─◈ ${prefix}ᴘʀᴏᴍᴘᴛ ɪᴅ (ᴍᴇᴍʙᴇʀ)\n`;
            menu += `│ ╰─◈ ${prefix}ᴘʀᴏᴍᴘᴛ ɢᴜᴇsᴛ (ǫᴜɪᴄᴋ)\n`;
            menu += `└────────────────────────┈\n\n`;
            menu += `◈ *ᴄʟᴏsᴇ:* ${prefix}ᴘʀᴏᴍᴘᴛ ᴄʟᴏsᴇ\n`;
            menu += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;
            
            return await sock.sendMessage(from, { text: menu });
        }

        const state = global.promptState.get(senderPhone);

        // --- STEP 2: MEMBER ID VERIFICATION ---
        if (state.step === 1) {
            if (answer.toLowerCase() === 'guest') {
                state.step = 3; state.vHubId = "GUEST";
                return sock.sendMessage(from, { text: `┌─『 ᴠ-ʜᴜʙ ɢᴜᴇsᴛ 』\n│ ⚙ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ <ᴀᴍᴏᴜɴᴛ> <ᴘʜᴏɴᴇ>\n│ ◈ *ᴇx:* ${prefix}ᴘʀᴏᴍᴘᴛ 𝟷𝟶 𝟶𝟽𝟶𝟶𝟶𝟶𝟶𝟶𝟶𝟶\n└────────────────────────┈` });
            }

            const vHubId = answer.toUpperCase().startsWith('VH-') ? answer.toUpperCase() : `VH-${answer.toUpperCase()}`;
            try {
                await client.connect();
                const user = await client.db("vinnieBot").collection("wallets").findOne({ vHubId });
                if (!user) {
                    global.promptState.delete(senderPhone);
                    return sock.sendMessage(from, { text: "┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚠️ ɪɴᴠᴀʟɪᴅ ɪᴅ. ᴛʀʏ .ᴘʀᴏᴍᴘᴛ ɢᴜᴇsᴛ?\n└────────────────────────┈" });
                }
                state.vHubId = user.vHubId; state.name = user.name; state.step = 2;
                
                let authMsg = `┌────────────────────────┈\n`;
                authMsg += `│      *ᴠ-ʜᴜʙ_ᴀᴜᴛʜ* \n`;
                authMsg += `└────────────────────────┈\n\n`;
                authMsg += `┌─『 sᴇssɪᴏɴ_ᴀᴄᴛɪᴠᴇ 』\n`;
                authMsg += `│ ✨ *ᴡᴇʟᴄᴏᴍᴇ,* ${user.name}\n`;
                authMsg += `│ ⚙ *ǫᴜᴇsᴛɪᴏɴ:* ʜᴏᴡ ᴍᴜᴄʜ ᴛᴏ ᴅᴇᴘᴏsɪᴛ?\n`;
                authMsg += `└────────────────────────┈\n\n`;
                authMsg += `◈ *ʀᴇᴘʟʏ:* ${prefix}ᴘʀᴏᴍᴘᴛ [ᴀᴍᴏᴜɴᴛ]`;
                
                return sock.sendMessage(from, { text: authMsg });
            } catch (e) { return sock.sendMessage(from, { text: "│ ❌ ᴅʙ ᴏғғʟɪɴᴇ." }); }
        }

        // --- STEP 3: AMOUNT -> ASK PHONE ---
        if (state.step === 2) {
            if (isNaN(answer)) return sock.sendMessage(from, { text: "│ ❌ ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ɴᴜᴍᴇʀɪᴄ ᴀᴍᴏᴜɴᴛ." });
            state.amount = answer; state.step = 4;
            
            let payMsg = `┌────────────────────────┈\n`;
            payMsg += `│      *ᴠ-ʜᴜʙ_ᴘᴀʏᴍᴇɴᴛ* \n`;
            payMsg += `└────────────────────────┈\n\n`;
            payMsg += `┌─『 ᴛx_ᴅᴇᴛᴀɪʟs 』\n`;
            payMsg += `│ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${state.amount}\n`;
            payMsg += `│ ⚙ *ǫᴜᴇsᴛɪᴏɴ:* ᴇɴᴛᴇʀ ᴍ-ᴘᴇsᴀ ɴᴜᴍʙᴇʀ.\n`;
            payMsg += `└────────────────────────┈\n\n`;
            payMsg += `◈ *ʀᴇᴘʟʏ:* ${prefix}ᴘʀᴏᴍᴘᴛ 𝟶𝟽...`;
            
            return sock.sendMessage(from, { text: payMsg });
        }

        // --- STEP 4: FINAL VALIDATION & PUSH ---
        if (state.step === 3 || state.step === 4) {
            let amt, ph;
            if (state.step === 3) { [amt, ph] = answer.split(" "); } else { amt = state.amount; ph = answer; }

            if (!ph || isAirtel(ph)) return sock.sendMessage(from, { text: "│ ❌ ɪɴᴠᴀʟɪᴅ ɴᴜᴍʙᴇʀ ᴏʀ ᴀɪʀᴛᴇʟ ᴍᴏɴᴇʏ." });
            state.amount = amt; state.phone = ph.startsWith('0') ? '254' + ph.slice(1) : ph;
            state.step = 'EXECUTING';
            return this.triggerPush(sock, from, senderPhone);
        }
    },

    async triggerPush(sock, from, senderPhone) {
        const state = global.promptState.get(senderPhone);
        const { key } = await sock.sendMessage(from, { 
            text: `┌─『 sʏsᴛᴇᴍ_ʟᴏɢ 』\n│ ⚙ ɪɴɪᴛɪᴀᴛɪɴɢ sᴛᴋ ᴘᴜsʜ...\n│ ⚙ ᴛᴀʀɢᴇᴛ: ${state.vHubId}\n└────────────────────────┈` 
        });

        try {
            const res = await hubClient.deposit(state.phone, state.amount, from, state.vHubId);
            if (res.success || res.ResponseCode === "0") {
                let pushMsg = `┌────────────────────────┈\n`;
                pushMsg += `│      *ᴠ-ʜᴜʙ_ᴘᴀʏ* \n`;
                pushMsg += `└────────────────────────┈\n\n`;
                pushMsg += `┌─『 sᴛᴋ_ᴘᴜsʜ_sᴇɴᴛ 』\n`;
                pushMsg += `│ ✅ *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${state.amount}\n`;
                pushMsg += `│ 🆔 *ʀᴇғ:* ${state.vHubId}\n`;
                pushMsg += `│ 📢 *ᴀᴄᴛɪᴏɴ:* ᴇɴᴛᴇʀ ᴘɪɴ ᴏɴ ᴘʜᴏɴᴇ.\n`;
                pushMsg += `└────────────────────────┈`;
                
                await sock.sendMessage(from, { text: pushMsg, edit: key });
                global.promptState.delete(senderPhone);
            } else {
                global.promptState.delete(senderPhone);
                await sock.sendMessage(from, { text: "│ ❌ ᴘᴜsʜ ғᴀɪʟᴇᴅ. ᴄʜᴇᴄᴋ ɴᴜᴍʙᴇʀ/ʙᴀʟᴀɴᴄᴇ.", edit: key });
            }
        } catch (e) { 
            global.promptState.delete(senderPhone); 
            await sock.sendMessage(from, { text: "│ ❌ sʏsᴛᴇᴍ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ᴇʀʀᴏʀ.", edit: key });
        }
    }
};

export default promptCommand;
