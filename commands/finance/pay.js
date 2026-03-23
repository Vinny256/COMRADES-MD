
import hubClient from '../../utils/hubClient.js'; 

const payCommand = {
    name: 'pay',
    category: 'finance',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        if (!from) return;

        try {
            // --- 1. IDENTITY & SECURITY ---
            const sender = m.key.participant || m.key.remoteJid;
            const senderPhone = sender.replace(/[^0-9]/g, ''); 
            const rawName = m.pushName || "ᴠ_ʜᴜʙ_ᴍᴇᴍʙᴇʀ";
            
            if (rawName === "ᴠ_ʜᴜʙ_ᴍᴇᴍʙᴇʀ" || !m.pushName) {
                return sock.sendMessage(from, { 
                    text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ\n│ ⚙ *ʀᴇᴀsᴏɴ:* ᴀɴᴏɴʏᴍᴏᴜs ᴜsᴇʀ\n│ 💡 sᴇᴛ ᴀ ɴᴀᴍᴇ ɪɴ ᴡᴀ sᴇᴛᴛɪɴɢs.\n└────────────────────────┈` 
                }, { quoted: m });
            }

            const truncatedName = rawName.substring(0, 12);
            const amount = args[0];
            let targetPhone = args[1];

            // --- 2. INPUT VALIDATION ---
            const prefix = process.env.PREFIX || '.';
            if (!amount || isNaN(amount) || !targetPhone) {
                return sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* ${prefix}ᴘᴀʏ [ᴀᴍᴏᴜɴᴛ] [ᴘʜᴏɴᴇ]\n│ ⚙ *ᴇx:* ${prefix}ᴘᴀʏ 𝟻𝟶𝟶 𝟶𝟽𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾\n└────────────────────────┈` 
                }, { quoted: m });
            }

            if (Number(amount) < 10) {
                return sock.sendMessage(from, { text: "┌─『 ᴠ_ʜᴜʙ 』\n│ ⚠️ ᴍɪɴɪᴍᴜᴍ ᴡɪᴛʜᴅʀᴀᴡᴀʟ ɪs ᴋsʜ 𝟷𝟶.\n└────────────────────────┈" }, { quoted: m });
            }

            // Standardize target phone
            if (targetPhone.startsWith('0')) targetPhone = '254' + targetPhone.slice(1);
            if (targetPhone.startsWith('+')) targetPhone = targetPhone.slice(1);

            const { key } = await sock.sendMessage(from, { 
                text: `┌────────────────────────┈\n` +
                      `│      *ғɪɴᴀɴᴄᴇ_sᴇʀᴠᴇʀ* \n` +
                      `└────────────────────────┈\n\n` +
                      `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n` +
                      `│ ⚙ *ᴀᴄᴛɪᴏɴ:* ᴄᴏɴᴛᴀᴄᴛɪɴɢ_ʜᴜʙ\n` +
                      `│ ⚙ *sᴛᴀᴛ:* [ ᴀᴜᴛʜᴇɴᴛɪᴄᴀᴛɪɴɢ... ]\n` +
                      `└────────────────────────┈`
            }, { quoted: m });

            // --- 3. API AUTHENTICATION ---
            const check = await hubClient.checkStatus(senderPhone);

            if (!check || check.status !== "OK") {
                return sock.sendMessage(from, { 
                    text: `┌─『 ᴠ_ʜᴜʙ ᴇʀʀᴏʀ 』\n│ ⚙ *sᴛᴀᴛᴜs:* ᴜsᴇʀ ɴᴏᴛ ғᴏᴜɴᴅ\n│ ⚙ *ᴘʜᴏɴᴇ:* ${senderPhone}\n│ 💡 ʀᴇɢɪsᴛᴇʀ ғɪʀsᴛ ᴠɪᴀ: .ɴᴇᴡ\n└────────────────────────┈`,
                    edit: key 
                });
            }

            // --- 4. LIMITS & BALANCE ---
            const DAILY_MAX = 10000;
            const spentToday = (check.history || [])
                .filter(tx => tx.type === "WITHDRAW" && new Date(tx.date).toDateString() === new Date().toDateString())
                .reduce((sum, tx) => sum + (tx.amount || 0), 0);

            if (spentToday + Number(amount) > DAILY_MAX) {
                return sock.sendMessage(from, { 
                    text: `┌─『 ʟɪᴍɪᴛ_ᴀʟᴇʀᴛ 』\n│ ⚙ *ᴍᴀx:* ᴋsʜ ${DAILY_MAX}\n│ ⚙ *sᴘᴇɴᴛ:* ᴋsʜ ${spentToday}\n└────────────────────────┈`,
                    edit: key 
                });
            }

            if (Number(check.balance) < Number(amount)) {
                return sock.sendMessage(from, { 
                    text: `┌─『 ɪɴsᴜғғɪᴄɪᴇɴᴛ 』\n│ ⚙ *ʙᴀʟᴀɴᴄᴇ:* ᴋsʜ ${check.balance}\n└────────────────────────┈`, 
                    edit: key 
                });
            }

            // --- 5. DISBURSEMENT ---
            const res = await hubClient.withdraw(targetPhone, amount, truncatedName);

            if (res && res.success) {
                let successMsg = `┌────────────────────────┈\n`;
                successMsg += `│      *ᴠ_ʜᴜʙ_sᴜᴄᴄᴇss* \n`;
                successMsg += `└────────────────────────┈\n\n`;
                successMsg += `┌─『 ᴛx_ᴄᴏᴍᴘʟᴇᴛᴇ 』\n`;
                successMsg += `│ ✅ *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${amount}\n`;
                successMsg += `│ 📱 *sᴇɴᴛ ᴛᴏ:* ${targetPhone}\n`;
                successMsg += `│ 🧾 *ʀᴇғ:* ${res.receipt || 'ʜᴜʙ-ᴛx'}\n`;
                successMsg += `│ 🏦 *ʙᴀʟ:* ᴋsʜ ${res.newBalance}\n`;
                successMsg += `└────────────────────────┈`;
                
                await sock.sendMessage(from, { text: successMsg, edit: key });
            } else {
                throw new Error(res?.message || "ɢᴀᴛᴇᴡᴀʏ ᴏғғʟɪɴᴇ");
            }

        } catch (err) {
            console.error("┃ ❌ PAY_ERROR:", err.message);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${err.message}\n│ ⚠️ ʀᴇᴘᴏʀᴛ ᴛᴏ ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ.\n└────────────────────────┈`
            });
        }
    }
};

export default payCommand;
