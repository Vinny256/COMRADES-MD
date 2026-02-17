const hubClient = require('../../utils/hubClient');

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

        // 2. Initial "Ghost" Message (To be edited)
        const msg = await sock.sendMessage(remoteJid, { 
            text: `⏳ *V_HUB:* Processing request for ${waName}...` 
        }, { quoted: m });

        try {
            // 3. Trigger Proxy STK Push
            const result = await hubClient.deposit(phone, amount, remoteJid, waName);

            if (result && (result.ResponseCode === "0" || result.success)) {
                // 4. Success UI - The "Single Block" Professional View
                const successText = `┏━━━━━ ✿ *V_HUB_PAY* ✿ ━━━━━┓
┃
┃ ✅ *STK PUSH SENT!*
┃ 👤 *USER:* ${waName}
┃ 📱 *TARGET:* ${phone}
┃ 💰 *AMOUNT:* KSH ${amount}
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 📢 *WHAT HAPPENS NOW?*
┃ 1. Check your phone for the PIN pop-up.
┃ 2. Enter your M-PESA PIN to confirm.
┃ 3. You will receive an instant 
┃    confirmation here once paid.
┃
┃ ⚠️ _Wait up to 30 seconds for pop-up._
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sock.sendMessage(remoteJid, { 
                    text: successText,
                    edit: msg.key 
                });
            } else {
                // 5. Rejection UI
                await sock.sendMessage(remoteJid, { 
                    text: `❌ *V_HUB: REQUEST FAILED*\n\nSafaricom was unable to initiate the STK push to ${phone}. Please ensure the number is active and has no M-PESA lock.`,
                    edit: msg.key
                });
            }
        } catch (err) {
            // 6. Crash Protection
            await sock.sendMessage(remoteJid, { 
                text: "⚠️ *V_HUB: SERVER ERROR*\n\nConnection to the Vinnie Digital Hub Proxy was lost. Please try again in a few minutes.",
                edit: msg.key
            });
        }
    }
};