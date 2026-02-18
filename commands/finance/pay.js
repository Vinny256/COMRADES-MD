const hubClient = require('../../utils/hubClient');

module.exports = {
    name: 'pay',
    category: 'finance',
    async execute(conn, m, args) {
        const sock = conn?.sendMessage ? conn : (m.conn || global.conn);
        const remoteJid = m.key.remoteJid;
        
        // --- 1. OWNER SECURITY CHECK ---
        // Hardcoded your number + check for Environment Variable for future cloners
        const masterDirector = "254788032713@s.whatsapp.net";
        const envOwner = process.env.OWNER_NUMBER ? process.env.OWNER_NUMBER + "@s.whatsapp.net" : masterDirector;
        
        if (m.key.remoteJid !== masterDirector && m.key.remoteJid !== envOwner && !m.key.fromMe) {
            return sock.sendMessage(remoteJid, { text: "🚫 *V_HUB:* Access Denied. Only the Founder can disburse funds." });
        }

        const amount = args[0];
        let phone = args[1];

        // --- 2. VALIDATION ---
        if (!amount || isNaN(amount) || !phone) {
            return sock.sendMessage(remoteJid, { text: "❌ *Usage:* `.pay <amount> <phone>`" });
        }

        if (Number(amount) < 10) {
            return sock.sendMessage(remoteJid, { text: "⚠️ *V_HUB:* M-PESA B2C requires a minimum of KSH 10." });
        }

        if (phone.startsWith('0')) phone = '254' + phone.slice(1);

        // --- 3. INITIAL FEEDBACK (EDITABLE MESSAGE) ---
        const msg = await sock.sendMessage(remoteJid, { text: "⏳ *V_HUB:* Validating disbursement request..." });

        // --- 4. SAFE EXECUTION (CRASH PROTECTION) ---
        try {
            const processingText = `┏━━━━━ ✿ *V_HUB_BANKING* ✿ ━━━━━┓
┃
┃ 📥 *REQUEST RECEIVED*
┃ 👤 *TO:* ${phone}
┃ 💰 *AMOUNT:* KSH ${amount}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🕒 *CONFIRMATION:*
┃ Your request has been received. 
┃ Please wait for M-PESA confirmation.
┃
┃ 🛠️ _Disbursing via Hub Engine..._
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

            await sock.sendMessage(remoteJid, { text: processingText, edit: msg.key });

            // Using hubClient to keep index.js clean
            const res = await hubClient.withdraw(phone, amount);

            if (res && res.success) {
                const finalReceipt = `┏━━━━━ ✿ *V_HUB_SUCCESS* ✿ ━━━━━┓
┃
┃ ✅ *TRANSFER DISBURSED!*
┃ 💵 *DEBITED:* KSH ${amount}
┃ 📱 *RECIPIENT:* ${phone}
┃ 🧾 *REF:* ${res.receipt || 'B2C_OK'}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ _The amount has been deducted from_
┃ _the Hub wallet in your favour._
┃
┃ 🏦 *NEW BAL:* KSH ${res.newBalance}
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sock.sendMessage(remoteJid, { text: finalReceipt });
            } else {
                throw new Error(res?.message || "M-Pesa Gateway Timeout");
            }

        } catch (err) {
            // This prevents the whole bot from crashing
            console.error("┃ ❌ PAY_COMMAND_ERROR:", err.message);
            await sock.sendMessage(remoteJid, { 
                text: `┏━━━━━ ✿ *V_HUB_ERROR* ✿ ━━━━━┓\n┃\n┃ ❌ *PAYMENT FAILED*\n┃ ⚠️ *REASON:* ${err.message}\n┃\n┃ _Bot is still active. Please try_\n┃ _again later or contact admin._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                edit: msg.key 
            });
        }
    }
};