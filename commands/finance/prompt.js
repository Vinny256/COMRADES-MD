const hubClient = require('../../utils/hubClient');
const axios = require('axios');

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(conn, m, args, { prefix }) {
        const sock = conn?.sendMessage ? conn : (m.conn || global.conn);
        const remoteJid = m.key.remoteJid;
        const waName = m.pushName || "Comrade";

        // --- 1. THE GATEWAY MENU ---
        // If no arguments are provided, show the Bank Selection Menu
        if (args.length === 0) {
            const gatewayMenu = `┏━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━┓
┃
┃ ✨ *ᴡᴇʟᴄᴏᴍᴇ,* ${waName}
┃ 🏦 *ᴠ-ʜᴜʙ ꜰɪɴᴀɴᴄᴇ ɢᴀᴛᴇᴡᴀʏ*
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🆕 *[ .new ]* ┃ _Create a V-HUB Wallet & PIN_
┃
┃ 🔑 *[ .login ]* ┃ _Access your existing Wallet_
┃
┃ 👤 *[ .guest ]* ┃ _Quick deposit without an ID_
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 💡 *ᴛɪᴘ:* ᴛʏᴘᴇ ᴛʜᴇ ᴄᴏᴍᴍᴀɴᴅ ᴀʙᴏᴠᴇ 
┃ ᴛᴏ ᴘʀᴏᴄᴇᴇᴅ ᴡɪᴛʜ ʏᴏᴜʀ ᴛʀᴀɴsᴀᴄᴛɪᴏɴ.
┃
┃ © 2026 | ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

            return sock.sendMessage(remoteJid, { text: gatewayMenu }, { quoted: m });
        }

        // --- 2. GUEST LOGIC (RESTORED & PRESERVED) ---
        // Allows: .prompt <amount> <phone>
        const amount = args[0];
        let phone = args[1];

        if (!amount || isNaN(amount) || !phone) {
            return sock.sendMessage(remoteJid, { 
                text: `❌ *ɢᴜᴇsᴛ ᴇʀʀᴏʀ*\n\nUsage: ${prefix}prompt <amount> <phone>\n_Or type ${prefix}prompt for the Wallet Menu._` 
            }, { quoted: m });
        }

        if (phone.startsWith('0')) phone = '254' + phone.slice(1);

        const msg = await sock.sendMessage(remoteJid, { 
            text: `⏳ *ᴠ-ʜᴜʙ:* ᴘʀᴏᴄᴇssɪɴɢ ɢᴜᴇsᴛ ᴅᴇᴘᴏsɪᴛ ꜰᴏʀ ${waName}...` 
        }, { quoted: m });

        try {
            // Trigger STK Push via Proxy
            const result = await hubClient.deposit(phone, amount, remoteJid, waName);

            if (result && (result.ResponseCode === "0" || result.success)) {
                const waitingText = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴘᴀʏ* ✿ ━━━━━┓\n┃\n┃ ✅ *sᴛᴋ ᴘᴜsʜ sᴇɴᴛ!*\n┃ 💰 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${amount}\n┃ 📱 *ᴛᴀʀɢᴇᴛ:* ${phone}\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃\n┃ 📢 *ᴀᴄᴛɪᴏɴ ʀᴇǫᴜɪʀᴇᴅ:*\n┃ 1. ᴇɴᴛᴇʀ ᴍ-ᴘᴇsᴀ ᴘɪɴ.\n┃ 2. ᴡᴀɪᴛ ꜰᴏʀ ᴀᴜᴛᴏ-ᴠᴇʀɪꜰɪᴄᴀᴛɪᴏɴ.\n┃\n┃ 🕒 _sᴛᴀᴛᴜs: ᴀᴡᴀɪᴛɪɴɢ ᴘɪɴ..._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sock.sendMessage(remoteJid, { text: waitingText, edit: msg.key });

                // SMART POLLING ENGINE
                let attempts = 0;
                const checkInterval = setInterval(async () => {
                    attempts++;
                    try {
                        const PROXY_URL = "https://vhubg-27494ea43fc4.herokuapp.com";
                        const check = await axios.get(`${PROXY_URL}/api/check-status?phone=${phone}`);
                        
                        if (check.data.status === "OK" && check.data.isRecent) {
                            clearInterval(checkInterval);
                            const tx = check.data.lastTransaction;
                            const successReceipt = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ʀᴇᴄᴇɪᴘᴛ* ✿ ━━━━━┓\n┃\n┃ ✅ *ᴘᴀʏᴍᴇɴᴛ ᴠᴇʀɪꜰɪᴇᴅ*\n┃ 💵 *ᴀᴍᴏᴜɴᴛ:* ᴋsʜ ${tx.amount}\n┃ 🧾 *ʀᴇꜰ:* ${tx.receipt}\n┃ 🏦 *ɴᴇᴡ ʙᴀʟ:* ᴋsʜ ${check.data.balance}\n┃\n┃ _ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ - ᴠɪɴɴɪᴇ ʜᴜʙ_ \n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                            
                            await sock.sendMessage(remoteJid, { text: successReceipt }, { quoted: m });
                        }
                    } catch (e) {
                        if (attempts >= 4) { // Increased to 40 seconds for better success rate
                            clearInterval(checkInterval);
                            const errorText = `┏━━━━━ ✿ *ᴠ-ʜᴜʙ_ᴇʀʀᴏʀ* ✿ ━━━━━┓\n┃\n┃ ❌ *ᴠᴇʀɪꜰɪᴄᴀᴛɪᴏɴ ꜰᴀɪʟᴇᴅ*\n┃ \n┃ sʏsᴛᴇᴍ ᴛɪᴍᴇᴏᴜᴛ. ᴇɪᴛʜᴇʀ ᴛʜᴇ ᴘɪɴ \n┃ ᴡᴀsɴ'ᴛ ᴇɴᴛᴇʀᴇᴅ ᴏʀ ᴍ-ᴘᴇsᴀ ɪs sʟᴏᴡ.\n┃\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃\n┃ 🛠️ _sᴛᴀᴛᴜs: ᴛɪᴍᴇᴏᴜᴛ_\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                            await sock.sendMessage(remoteJid, { text: errorText, edit: msg.key });
                        }
                    }
                }, 10000);

            } else {
                await sock.sendMessage(remoteJid, { text: `❌ *ᴠ-ʜᴜʙ: ʀᴇǫᴜᴇsᴛ ꜰᴀɪʟᴇᴅ*\n\nsᴛᴋ ᴄᴏᴜʟᴅ ɴᴏᴛ ʙᴇ ɪɴɪᴛɪᴀᴛᴇᴅ.`, edit: msg.key });
            }
        } catch (err) {
            await sock.sendMessage(remoteJid, { text: "⚠️ *ᴠ-ʜᴜʙ: sᴇʀᴠᴇʀ ᴇʀʀᴏʀ*\n\nᴘʀᴏxʏ ᴄᴏɴɴᴇᴄᴛɪᴏɴ ʟᴏsᴛ.", edit: msg.key });
        }
    }
};
