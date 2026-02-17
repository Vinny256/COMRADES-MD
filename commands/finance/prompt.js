const hubClient = require('../../utils/hubClient');

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(m, args) {
        const amount = args[0];
        let phone = args[1]; // User provides the M-PESA number here

        // 1. Validation
        if (!amount || isNaN(amount) || !phone) {
            return m.reply("✿ *V_HUB FINANCE* ✿\n\nUsage: `.prompt <amount> <mpesa_number>`\nExample: `.prompt 50 0712345678`.");
        }

        // Clean the phone number (convert 07... to 2547...)
        if (phone.startsWith('0')) {
            phone = '254' + phone.slice(1);
        }

        // 2. Identify the WhatsApp User (Username fallback)
        const waName = m.pushName || "V_tester";
        
        await m.reply(`┏━━━━━ ✿ *V_HUB_PAY* ✿ ━━━━━┓\n┃\n┃ 📥 *DEPOSIT:* KSH ${amount}\n┃ 👤 *USER:* ${waName}\n┃ 📱 *STK_TO:* ${phone}\n┃ ⏳ *STATUS:* SENDING PUSH...\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`);

        // 3. Trigger the Proxy using the PROVIDED number
        const result = await hubClient.deposit(phone, amount, m.chat);

        if (result && result.ResponseCode === "0") {
            await m.reply("✅ *STK PUSH SENT!*\n\nPlease check the phone associated with " + phone + " to enter your PIN.");
        } else {
            await m.reply("⚠️ *V_HUB ERROR*: Could not initiate payment. Ensure the number is correct.");
        }
    }
};