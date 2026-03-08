const hubClient = require('../../utils/hubClient');

// Global memory for steps
global.promptState = global.promptState || new Map();

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(sock, msg, args, { prefix }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const senderPhone = sender.split('@')[0];
        const answer = args.join(" ").trim();

        // --- HELPER: CHECK FOR AIRTEL NUMBERS ---
        const isAirtel = (num) => {
            const clean = num.replace(/\D/g, '');
            // Airtel Kenya prefixes: 073, 075, 078, 010, 011
            return /^(254|0)(73|75|78|10|11)/.test(clean);
        };

        // --- STEP 1: INITIAL GATEWAY MENU ---
        if (!global.promptState.has(senderPhone)) {
            // Check if they tried a Guest Long Command immediately
            if (args.length >= 2) {
                const [amt, ph] = args;
                if (isAirtel(ph)) return sock.sendMessage(from, { text: "❌ *ᴀɪʀᴛᴇʟ ɴᴏᴛ sᴜᴘᴘᴏʀᴛᴇᴅ*\n\nʀᴇǫᴜᴇsᴛ ᴄᴏᴜʟᴅɴ'ᴛ ᴘʀᴏᴄᴇᴇᴅ ꜰᴏʀ ᴀɴ ᴀɪʀᴛᴇʟ ᴍᴏɴᴇʏ ɴᴜᴍʙᴇʀ. ᴅᴇᴘᴏsɪᴛ ꜰᴏʀ ᴛʜᴇᴍ ᴄᴏᴍɪɴɢ sᴏᴏɴ!" });
                
                let finalPh = ph.startsWith('0') ? '254' + ph.slice(1) : ph;
                await sock.sendMessage(from, { text: `👤 *ᴠ-ʜᴜʙ ɢᴜᴇsᴛ:* sᴇɴᴅɪɴɢ sᴛᴋ ᴏꜰ ᴋsʜ ${amt} ᴛᴏ ${finalPh}...` });
                try {
                    await hubClient.deposit(finalPh, amt, from, "GUEST");
                    return;
                } catch (e) { return sock.sendMessage(from, { text: "⚠️ ɢᴀᴛᴇᴡᴀʏ ᴇʀʀᴏʀ." }); }
            }

            // Normal Menu
            global.promptState.set(senderPhone, { step: 1 });
            const menu = `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓\n┃\n┃ 🏦 *ᴠ-ʜᴜʙ ᴅᴇᴘᴏsɪᴛ*\n┃ _ʟᴇᴛ's ʟᴏᴀᴅ ʏᴏᴜʀ ᴡᴀʟʟᴇᴛ._\n┃\n┃ 🆕 *.new* - ʀᴇɢɪsᴛᴇʀ\n┃ 👤 *.prompt <ᴀᴍᴛ> <ᴘʜ>* - ɢᴜᴇsᴛ\n┃\n┃ ❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜᴀᴛ ɪs ʏᴏᴜʀ ᴠʜ-ɪᴅ?\n┃ 💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 1001\`\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            return await sock.sendMessage(from, { text: menu });
        }

        const state = global.promptState.get(senderPhone);

        // --- STEP 2: HANDLE ID -> ASK AMOUNT ---
        if (state.step === 1) {
            // SMART DETECTION: Did they type a phone number instead of an ID?
            if (answer.includes(" ") || (answer.length > 8 && !isNaN(answer))) {
                return sock.sendMessage(from, { text: "⚠️ *ɪɴᴠᴀʟɪᴅ ɪᴅ*\n\nᴀʀᴇ ʏᴏᴜ ᴛʀʏɪɴɢ ᴛᴏ ᴅᴇᴘᴏsɪᴛ ᴀs ᴀ ɢᴜᴇsᴛ?\nᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ᴡᴀʟʟᴇᴛ ɴᴜᴍʙᴇʀ (ᴇ.ɢ. 1001) ᴏʀ ʀᴇsᴛᴀʀᴛ." });
            }

            state.vHubId = answer.toUpperCase().startsWith('VH-') ? answer.toUpperCase() : `VH-${answer.toUpperCase()}`;
            state.step = 2;
            return await sock.sendMessage(from, { text: `✅ *ɪᴅ sᴇᴛ:* ${state.vHubId}\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* ʜᴏᴡ ᴍᴜᴄʜ ᴛᴏ ᴅᴇᴘᴏsɪᴛ?\n💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 10\`` });
        }

        // --- STEP 3: HANDLE AMOUNT -> ASK PHONE ---
        if (state.step === 2) {
            if (isNaN(answer)) return sock.sendMessage(from, { text: "❌ *ᴇʀʀᴏʀ:* ᴜsᴇ ɴᴜᴍʙᴇʀs ᴏɴʟʏ." });
            state.amount = answer;
            state.step = 3;
            return await sock.sendMessage(from, { text: `💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${state.amount}\n\n❓ *ǫᴜᴇsᴛɪᴏɴ:* ᴡʜɪᴄʜ ɴᴜᴍʙᴇʀ ᴛᴏ ᴘʀᴏᴍᴘᴛ?\n💡 *ʀᴇᴘʟʏ:* \`${prefix}prompt 07xxxxxxxx\`` });
        }

        // --- STEP 4: FINAL EXECUTION (STK PUSH) ---
        if (state.step === 3) {
            if (isAirtel(answer)) {
                return sock.sendMessage(from, { text: "❌ *ᴀɪʀᴛᴇʟ ɴᴏᴛ sᴜᴘᴘᴏʀᴛᴇᴅ*\n\nʀᴇǫᴜᴇsᴛ ᴄᴏᴜʟᴅɴ'ᴛ ᴘʀᴏᴄᴇᴇᴅ ꜰᴏʀ ᴀɴ ᴀɪʀᴛᴇʟ ᴍᴏɴᴇʏ ɴᴜᴍʙᴇʀ. ᴅᴇᴘᴏsɪᴛ ꜰᴏʀ ᴛʜᴇᴍ ᴄᴏᴍɪɴɢ sᴏᴏɴ!" });
            }

            let finalPhone = answer;
            if (finalPhone.startsWith('0')) finalPhone = '254' + finalPhone.slice(1);

            global.promptState.delete(senderPhone);
            await sock.sendMessage(from, { text: `🚀 *ᴠ-ʜᴜʙ:* sᴇɴᴅɪɴɢ sᴛᴋ ᴘᴜsʜ ᴛᴏ ${finalPhone}...` });

            try {
                const res = await hubClient.deposit(finalPhone, state.amount, from, state.vHubId);
                if (res.success || res.ResponseCode === "0") {
                    return await sock.sendMessage(from, { text: `✅ *sᴛᴋ sᴇɴᴛ!*\n💰 *ᴀᴍᴏᴜɴᴛ:* ${state.amount}\n🆔 *ʀᴇꜰ:* ${state.vHubId}\n\n📢 ᴇɴᴛᴇʀ ᴘɪɴ ᴏɴ ʏᴏᴜʀ ᴘʜᴏɴᴇ.` });
                }
            } catch (e) { return sock.sendMessage(from, { text: "❌ *sᴛᴋ ꜰᴀɪʟᴇᴅ*" }); }
        }
    }
};
