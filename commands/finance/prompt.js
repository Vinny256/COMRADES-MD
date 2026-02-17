const hubClient = require('../../utils/hubClient');

module.exports = {
    name: 'prompt',
    category: 'finance',
    async execute(conn, m, args) { // 'conn' is your Baileys socket
        // 1. Safety Check: If conn is undefined, we try to find it in the message
        const sock = conn?.sendMessage ? conn : (m.conn || global.conn);
        
        const amount = args[0];
        let phone = args[1];
        const remoteJid = m.key.remoteJid;

        // 2. Validation
        if (!amount || isNaN(amount) || !phone) {
            const usage = "✿ *V_HUB FINANCE* ✿\n\nUsage: `.prompt <amount> <phone>`\nExample: `.prompt 50 0712345678`";
            return sock.sendMessage(remoteJid, { text: usage }, { quoted: m });
        }

        if (phone.startsWith('0')) phone = '254' + phone.slice(1);
        const waName = m.pushName || "V_Hub User";
        
        // 3. Status Update
        await sock.sendMessage(remoteJid, { 
            text: `┏━━━━━ ✿ *V_HUB_PAY* ✿ ━━━━━┓\n┃\n┃ 📥 *DEPOSIT:* KSH ${amount}\n┃ 👤 *USER:* ${waName}\n┃ 📱 *STK_TO:* ${phone}\n┃ ⏳ *STATUS:* SENDING PUSH...\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        }, { quoted: m });

        // 4. Trigger Proxy
        try {
            const result = await hubClient.deposit(phone, amount, remoteJid);
            
            if (result && result.ResponseCode === "0") {
                await sock.sendMessage(remoteJid, { text: "✅ *STK PUSH SENT!*\n\nEnter your PIN on the phone: " + phone }, { quoted: m });
            } else {
                await sock.sendMessage(remoteJid, { text: "❌ *V_HUB ERROR*\n\nSafaricom rejected the request. Check the number and try again." }, { quoted: m });
            }
        } catch (err) {
            await sock.sendMessage(remoteJid, { text: "⚠️ *SYSTEM ERROR*\n\nCould not connect to V_Hub Proxy." }, { quoted: m });
        }
    }
};