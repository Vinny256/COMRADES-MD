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

        // Format phone to 254 standard
        if (phone.startsWith('0')) phone = '254' + phone.slice(1);

        // 2. Initial Status Message
        const msg = await sock.sendMessage(remoteJid, { 
            text: `⏳ *V_HUB:* Processing request for ${waName}...` 
        }, { quoted: m });

        try {
            // 3. Trigger Proxy STK Push
            const result = await hubClient.deposit(phone, amount, remoteJid, waName);

            if (result && (result.ResponseCode === "0" || result.success)) {
                // 4. Update UI to tell user we are waiting
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
┃ 🕒 _Verifying in 25s..._
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sock.sendMessage(remoteJid, { 
                    text: waitingText,
                    edit: msg.key 
                });

                // 5. POLLING LOGIC (The Worker Bridge)
                setTimeout(async () => {
                    try {
                        // Knock on the Proxy's Status Door
                        // Replace the URL with your actual Proxy Heroku URL
                        const check = await axios.get(`https://vhubg-27494ea43fc4.herokuapp.com/api/check-status?phone=${phone}`);
                        
                        if (check.data.status === "OK" && check.data.isRecent) {
                            const tx = check.data.lastTransaction;
                            const successReceipt = `┏━━━━━ ✿ *V_HUB_RECEIPT* ✿ ━━━━━┓\n┃\n┃ ✅ *PAYMENT VERIFIED*\n┃ 💵 *AMOUNT:* KSH ${tx.amount}\n┃ 🧾 *REF:* ${tx.receipt}\n┃ 🏦 *NEW BAL:* KSH ${check.data.balance}\n┃\n┃ _Infinite Impact - Vinnie Hub_ \n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                            
                            await sock.sendMessage(remoteJid, { text: successReceipt }, { quoted: m });
                        } else {
                            // If no payment found after 25s
                            await sock.sendMessage(remoteJid, { 
                                text: "⚠️ *V_HUB:* Auto-verification timed out. If you paid, please check your `.balance` in a few seconds." 
                            }, { quoted: m });
                        }
                    } catch (e) {
                        console.error("┃ ❌ POLLING_ERROR:", e.message);
                    }
                }, 25000); // 25 seconds delay

            } else {
                await sock.sendMessage(remoteJid, { 
                    text: `❌ *V_HUB: REQUEST FAILED*\n\nSafaricom was unable to initiate the STK push.`,
                    edit: msg.key
                });
            }
        } catch (err) {
            await sock.sendMessage(remoteJid, { 
                text: "⚠️ *V_HUB: SERVER ERROR*\n\nConnection to the Vinnie Digital Hub Proxy was lost.",
                edit: msg.key
            });
        }
    }
};