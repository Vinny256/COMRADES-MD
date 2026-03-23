import hubClient from '../../utils/hubClient.js';

const refundCommand = {
    name: 'refund',
    category: 'owner',
    desc: 'Manual financial disbursement to members',
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ MASTER DIRECTOR SECURITY ---
        const masterDirector = "254788032713@s.whatsapp.net";
        if (msg.key.remoteJid !== masterDirector && !isMe) return;

        const amount = args[0];
        let targetPhone = args[1];

        // --- 📊 INPUT VALIDATION ---
        if (!amount || isNaN(amount) || !targetPhone) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ʀᴇғᴜɴᴅ [ᴀᴍᴏᴜɴᴛ] [ᴘʜᴏɴᴇ]\n│ ⚙ *ᴇx:* ${prefix}ʀᴇғᴜɴᴅ 𝟻𝟶𝟶 𝟶𝟽... \n└────────────────────────┈` 
            });
        }

        // Standardize Kenyan Format
        if (targetPhone.startsWith('0')) targetPhone = '254' + targetPhone.slice(1);

        // --- ✦ INITIAL REACTION & PROMPT ---
        const { key } = await sock.sendMessage(from, { 
            text: `┌─『 ᴠ_ʜᴜʙ_sʏsᴛᴇᴍ 』\n│ 🔍 ᴠᴇʀɪғʏɪɴɢ_ᴍᴇᴍʙᴇʀ_ɪᴅᴇɴᴛɪᴛʏ...\n└────────────────────────┈` 
        });

        try {
            // --- 🔎 DATABASE CHECK ---
            const userStatus = await hubClient.checkStatus(targetPhone);

            if (userStatus.status !== "OK") {
                return sock.sendMessage(from, { 
                    text: `┌─『 ᴠ_ʜᴜʙ_ᴇʀʀᴏʀ 』\n│ ❌ *ɴᴏᴛ_ғᴏᴜɴᴅ*\n│ 👤 *ᴜsᴇʀ:* ${targetPhone}\n│ ⚙ ʟᴏɢ: ᴜsᴇʀ_ɴᴏᴛ_ɪɴ_ᴅᴀᴛᴀʙᴀsᴇ\n└────────────────────────┈`,
                    edit: key 
                });
            }

            // --- 💰 BALANCE VALIDATION ---
            if (userStatus.balance < Number(amount)) {
                return sock.sendMessage(from, { 
                    text: `┌─『 ᴠ_ʜᴜʙ_ᴇʀʀᴏʀ 』\n│ ❌ *ʟᴏᴡ_ʙᴀʟᴀɴᴄᴇ*\n│ 👤 *ᴜsᴇʀ:* ${userStatus.v_hub_id || targetPhone}\n│ 💰 *ʜᴀs:* ᴋsʜ ${userStatus.balance}\n│ ⚙ ʟᴏɢ: ʀᴇғᴜɴᴅ_ᴇxᴄᴇᴇᴅs_ʙᴀʟᴀɴᴄᴇ\n└────────────────────────┈`,
                    edit: key 
                });
            }

            // --- 🚀 EXECUTE WITHDRAWAL (REFUND) ---
            const res = await hubClient.withdraw(targetPhone, amount, userStatus.v_hub_id);

            if (res.success) {
                // --- 📑 SUCCESS UI ---
                let successMsg = `┌────────────────────────┈\n`;
                successMsg += `│      *ᴠ-ʜᴜʙ_ʀᴇғᴜɴᴅ_ʟᴏɢ* \n`;
                successMsg += `└────────────────────────┈\n\n`;
                
                successMsg += `┌─『 ᴛʀᴀɴsᴀᴄᴛɪᴏɴ_ᴅᴇᴛᴀɪʟs 』\n`;
                successMsg += `│ ✅ *sᴛᴀᴛᴜs:* sᴜᴄᴄᴇssғᴜʟ\n`;
                successMsg += `│ 👤 *ᴍᴇᴍʙᴇʀ:* ${userStatus.v_hub_id || targetPhone}\n`;
                successMsg += `│ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${amount}\n`;
                successMsg += `│ 🧾 *ʀᴇғ:* ${res.receipt}\n`;
                successMsg += `└────────────────────────┈\n\n`;
                
                successMsg += `┌─『 sʏsᴛᴇᴍ_ᴜᴘᴅᴀᴛᴇ 』\n`;
                successMsg += `│ 🏦 *ɴᴇᴡ_ʙᴀʟ:* ᴋsʜ ${res.newBalance}\n`;
                successMsg += `│ ⚙ ʟᴏɢ: ᴍᴀɴᴜᴀʟ_ʀᴇғᴜɴᴅ_ᴇxᴇᴄ\n`;
                successMsg += `└────────────────────────┈\n\n`;
                
                successMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ - ꜰᴏᴜɴᴅᴇʀ ᴘʀɪᴠɪʟᴇɢᴇ_`;

                await sock.sendMessage(from, { text: successMsg, edit: key });
            } else {
                throw new Error(res.message);
            }

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ғᴀɪʟᴜʀᴇ 』\n│ ❌ *ᴇʀʀᴏʀ:* ${err.message}\n└────────────────────────┈`,
                edit: key 
            });
        }
    }
};

export default refundCommand;
