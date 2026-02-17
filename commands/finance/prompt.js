const hubClient = require('../utils/hubClient');

module.exports = {
    name: 'prompt',
    category: 'finance',
    description: 'Initiate a secure M-PESA deposit',
    async execute(m, args) {
        const amount = args[0];
        const sender = m.sender.split('@')[0];

        if (!amount || isNaN(amount) || amount < 1) {
            return m.reply("✿ *V_HUB FINANCE* ✿\n\nUsage: `.prompt <amount>`\nExample: `.prompt 50`\n\n_Minimum deposit is KSH 1._");
        }

        // 1. Sending the Initial Alert
        await m.reply(`┏━━━━━ ✿ *V_HUB_PAY* ✿ ━━━━━┓\n┃\n┃ 📥 *DEPOSIT:* KSH ${amount}\n┃ 📱 *DEST:* ${sender}\n┃ ⏳ *STATUS:* INITIATING...\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`);

        const result = await hubClient.deposit(sender, amount, m.chat);

        // 2. Handling the Response from YOUR Server to Safaricom
        if (result && result.ResponseCode === "0") {
            await m.reply("✅ *STK PUSH SENT!*\n\nPlease check your phone to enter your M-PESA PIN. _Vinnie Digital Hub_ is waiting for confirmation...");
        } else {
            // Handle if Safaricom or your Proxy fails
            console.error("┃ ❌ PROMPT_ERR:", result);
            await m.reply("⚠️ *V_HUB ERROR*\n\nWe are sorry, an error occurred on our side while connecting to Safaricom. Please try again in 5 minutes.");
        }
    }
};