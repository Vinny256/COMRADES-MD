const hubClient = require('../../utils/hubClient');
const axios = require('axios');

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(conn, m, args) {
        const sock = conn?.sendMessage ? conn : (m.conn || global.conn);
        const remoteJid = m.key.remoteJid;
        
        const amount = args[0];
        let phone = args[1];
        const waName = m.pushName || "V_Hub_Member";

        // 1. Validation Logic
        if (!amount || isNaN(amount) || !phone) {
            return sock.sendMessage(remoteJid, { 
                text: "✿ *V_HUB FINANCE* ✿\n\nUsage: `.prompt <amount> <phone>`\nExample: `.prompt 10 0712345678`" 
            }, { quoted: m });
        }

        if (phone.startsWith('0')) phone = '254' + phone.slice(1);

        // 2. Initial Message
        const msg = await sock.sendMessage(remoteJid, { 
            text: `⏳ *V_HUB:* Processing request for ${waName}...` 
        }, { quoted: m });

        try {
            // 3. Trigger STK Push
            const result = await hubClient.deposit(phone, amount, remoteJid, waName);

            if (result && (result.ResponseCode === "0" || result.success)) {
                const waitingText = `┏━━━━━ ✿ *V_HUB_PAY* ✿ ━━━━━┓
┃
┃ ✅ *STK PUSH SENT!*
┃ 👤 *USER:* ${waName}
┃ 💰 *AMOUNT:* KSH ${amount}
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 📢 *ACTION REQUIRED:*
┃ 1. Enter M-PESA PIN on your phone.
┃ 2. *Wait 25 seconds* for the bot to 
┃    auto-verify your transaction.
┃
┃ 🕒 _Status: Awaiting PIN..._
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sock.sendMessage(remoteJid, { text: waitingText, edit: msg.key });

                // 4. SMART POLLING ENGINE (Checks 3 times)
                let attempts = 0;
                const checkInterval = setInterval(async () => {
                    attempts++;
                    try {
                        const PROXY_URL = "https://vhubg-27494ea43fc4.herokuapp.com";
                        const check = await axios.get(`${PROXY_URL}/api/check-status?phone=${phone}`);
                        
                        if (check.data.status === "OK" && check.data.isRecent) {
                            clearInterval(checkInterval); // STOP POLLING
                            const tx = check.data.lastTransaction;
                            const successReceipt = `┏━━━━━ ✿ *V_HUB_RECEIPT* ✿ ━━━━━┓\n┃\n┃ ✅ *PAYMENT VERIFIED*\n┃ 💵 *AMOUNT:* KSH ${tx.amount}\n┃ 🧾 *REF:* ${tx.receipt}\n┃ 🏦 *NEW BAL:* KSH ${check.data.balance}\n┃\n┃ _Infinite Impact - Vinnie Hub_ \n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                            
                            await sock.sendMessage(remoteJid, { text: successReceipt }, { quoted: m });
                        }
                    } catch (e) {
                        // If we reach 3 attempts (approx 30-35 seconds) and still 404
                        if (attempts >= 3) {
                            clearInterval(checkInterval);
                            const errorText = `┏━━━━━ ✿ *V_HUB_ERROR* ✿ ━━━━━┓
┃
┃ ❌ *VERIFICATION FAILED*
┃ 
┃ Vinnie Hub faced an error. It's either 
┃ you didn't complete the transaction
┃ or M-PESA is delayed.
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 📢 *NEED HELP?*
┃ If you think this is a mistake, 
┃ please contact the admin.
┃
┃ 🛠️ _Status: Timeout_
┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                            
                            await sock.sendMessage(remoteJid, { text: errorText, edit: msg.key });
                        }
                    }
                }, 10000); // Checks every 10 seconds

            } else {
                await sock.sendMessage(remoteJid, { 
                    text: `❌ *V_HUB: REQUEST FAILED*\n\nSTK could not be initiated.`,
                    edit: msg.key
                });
            }
        } catch (err) {
            await sock.sendMessage(remoteJid, { 
                text: "⚠️ *V_HUB: SERVER ERROR*\n\nProxy connection lost.",
                edit: msg.key
            });
        }
    }
};