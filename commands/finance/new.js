import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

// Memory cache to track conversation steps
global.registrationState = global.registrationState || new Map();

const newAccountCommand = {
    name: 'new',
    category: 'finance',
    async execute(sock, msg, args, { prefix }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0].split(':')[0];
        const answer = args.join(" ").trim();

        // --- STEP 1: START (.new) ---
        if (!global.registrationState.has(senderPhone)) {
            global.registrationState.set(senderPhone, { step: 1 });
            
            let step1Msg = `┌────────────────────────┈\n`;
            step1Msg += `│      *ᴠ-ʜᴜʙ_ʀᴇɢɪsᴛʀᴀᴛɪᴏɴ* \n`;
            step1Msg += `└────────────────────────┈\n\n`;
            step1Msg += `┌─『 ᴀᴄᴄᴏᴜɴᴛ_sᴇᴛᴜᴘ 』\n`;
            step1Msg += `│ ⚙ *sᴛᴀᴛᴜs:* ɪɴɪᴛɪᴀʟɪᴢɪɴɢ...\n`;
            step1Msg += `│ ⚙ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜᴀᴛ ɪs ʏᴏᴜʀ ɴᴀᴍᴇ?\n`;
            step1Msg += `└────────────────────────┈\n\n`;
            step1Msg += `◈ *ʀᴇᴘʟʏ:* ${prefix}ɴᴇᴡ [ʏᴏᴜʀ_ɴᴀᴍᴇ]`;
            
            return sock.sendMessage(from, { text: step1Msg }, { quoted: msg });
        }

        const state = global.registrationState.get(senderPhone);

        // --- STEP 2: HANDLE NAME ---
        if (state.step === 1) {
            if (!answer) return sock.sendMessage(from, { text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴀᴍᴇ.\n└────────────────────────┈` });
            
            state.name = answer;
            state.step = 2;

            let step2Msg = `┌────────────────────────┈\n`;
            step2Msg += `│      *ᴠ-ʜᴜʙ_ʙᴀɴᴋɪɴɢ* \n`;
            step2Msg += `└────────────────────────┈\n\n`;
            step2Msg += `┌─『 sᴇᴄᴜʀɪᴛʏ_ᴄᴏɴғɪɢ 』\n`;
            step2Msg += `│ ✨ *ʜᴇʟʟᴏ,* ${state.name}!\n`;
            step2Msg += `│ ⚙ *ǫᴜᴇsᴛɪᴏɴ:* ᴄʜᴏᴏsᴇ ᴀ 𝟺-ᴅɪɢɪᴛ ᴘɪɴ.\n`;
            step2Msg += `│ ⚠️ *ɴᴏᴛᴇ:* ᴄᴀɴ'ᴛ sᴛᴀʀᴛ ᴡɪᴛʜ 𝟶 ᴏʀ 𝟷.\n`;
            step2Msg += `└────────────────────────┈\n\n`;
            step2Msg += `◈ *ʀᴇᴘʟʏ:* ${prefix}ɴᴇᴡ [𝟺-ᴅɪɢɪᴛs]`;

            return sock.sendMessage(from, { text: step2Msg }, { quoted: msg });
        }

        // --- STEP 3: HANDLE PIN & DB INSERT ---
        if (state.step === 2) {
            const pin = answer;
            if (pin.length !== 4 || isNaN(pin) || pin.startsWith('0') || pin.startsWith('1') || /^(\d)\1{3}$/.test(pin)) {
                return sock.sendMessage(from, { text: `┌─『 sᴇᴄᴜʀɪᴛʏ_ᴇʀʀ 』\n│ ⚙ ɪɴᴠᴀʟɪᴅ ᴘɪɴ ꜰᴏʀᴍᴀᴛ.\n│ ⚙ ᴍᴜsᴛ ʙᴇ 𝟺 ᴅɪɢɪᴛs (ɴᴏ 𝟶/𝟷 sᴛᴀʀᴛ).\n└────────────────────────┈` });
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
                    vHubId, 
                    waPhone: senderPhone, 
                    name: state.name,
                    pin: state.pin, 
                    balance: 0, 
                    createdAt: new Date()
                });

                let successMsg = `┌────────────────────────┈\n`;
                successMsg += `│      *ᴠ-ʜᴜʙ_sᴜᴄᴄᴇss* \n`;
                successMsg += `└────────────────────────┈\n\n`;
                successMsg += `┌─『 ᴀᴄᴄᴏᴜɴᴛ_ᴄʀᴇᴀᴛᴇᴅ 』\n`;
                successMsg += `│ 🆔 *ɪᴅ:* ${vHubId}\n`;
                successMsg += `│ 🏦 *ʙᴀʟ:* ᴋsʜ 𝟶\n`;
                successMsg += `│ ⚙ *ǫᴜᴇsᴛɪᴏɴ:* ᴅᴇᴘᴏsɪᴛ ɴᴏᴡ? (ʏᴇs/ɴᴏ)\n`;
                successMsg += `└────────────────────────┈\n\n`;
                successMsg += `◈ *ʀᴇᴘʟʏ:* ${prefix}ɴᴇᴡ ʏᴇs | ɴᴏ`;

                return sock.sendMessage(from, { text: successMsg }, { quoted: msg });

            } catch (e) {
                global.registrationState.delete(senderPhone);
                return sock.sendMessage(from, { text: "┌─『 ᴅʙ_ᴇʀʀᴏʀ 』\n│ ⚙ ᴄᴏᴜʟᴅ ɴᴏᴛ sᴀᴠᴇ ᴀᴄᴄᴏᴜɴᴛ.\n└────────────────────────┈" });
            }
        }

        // --- STEP 4: FINALIZATION ---
        if (state.step === 3) {
            global.registrationState.delete(senderPhone);
            if (answer.toLowerCase() === 'yes') {
                return sock.sendMessage(from, { text: `┌─『 ᴠ-ʜᴜʙ 』\n│ 💰 ᴛʏᴘᴇ *${prefix}ᴘʀᴏᴍᴘᴛ* ᴛᴏ ʙᴇɢɪɴ!\n└────────────────────────┈` });
            } else {
                return sock.sendMessage(from, { text: "┌─『 ᴠ-ʜᴜʙ 』\n│ 🤝 ᴀᴄᴄᴏᴜɴᴛ sᴀᴠᴇᴅ. sᴇᴇ ʏᴏᴜ sᴏᴏɴ!\n└────────────────────────┈" });
            }
        }
    }
};

export default newAccountCommand;
