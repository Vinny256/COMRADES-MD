const hubClient = require('../../utils/hubClient');

module.exports = {
    name: 'pay',
    category: 'finance',
    async execute(conn, m, args) {
        // --- 1. SMART SOCKET SELECTION ---
        const sock = conn?.sendMessage ? conn : (m.conn || global.conn);
        const from = m.key.remoteJid;
        if (!from) return;

        try {
            // --- 2. IDENTITY & PHONE CLEANING ---
            const sender = m.key.participant || m.key.remoteJid;
            const senderPhone = sender.replace(/[^0-9]/g, ''); // Strips @s.whatsapp.net
            
            const rawName = m.pushName || "V_Hub_Member";
            
            // SECURITY: Block anonymous/default names
            if (rawName === "V_Hub_Member" || !m.pushName) {
                return sock.sendMessage(from, { 
                    text: "┏━━━━━ ✿ *V_HUB_SECURITY* ✿ ━━━━━┓\n┃\n┃ ❌ *ACCESS DENIED*\n┃ 👤 *USER:* Anonymous\n┃\n┃ _Please set a name in WhatsApp_\n┃ _settings to enable finance tools._\n┗━━━━━━━━━━━━━━━━━━━━━━┛" 
                }, { quoted: m });
            }

            const truncatedName = rawName.substring(0, 12);
            const amount = args[0];
            let targetPhone = args[1];

            // --- 3. INPUT VALIDATION ---
            if (!amount || isNaN(amount) || !targetPhone) {
                return sock.sendMessage(from, { text: `📑 *Usage:* ${process.env.PREFIX || '.'}pay <amount> <phone>` }, { quoted: m });
            }

            if (Number(amount) < 10) {
                return sock.sendMessage(from, { text: "⚠️ *V_HUB:* Minimum withdrawal is KSH 10." }, { quoted: m });
            }

            // Standardize target phone to 254 format
            if (targetPhone.startsWith('0')) targetPhone = '254' + targetPhone.slice(1);
            if (targetPhone.startsWith('+')) targetPhone = targetPhone.slice(1);

            const wait = await sock.sendMessage(from, { text: "⏳ *V_HUB:* Contacting Finance Server..." }, { quoted: m });

            // --- 4. THE API CALL (Where the 404 happens) ---
            const check = await hubClient.checkStatus(senderPhone);

            if (!check || check.status !== "OK") {
                return sock.sendMessage(from, { 
                    text: `┏━━━━━ ✿ *V_HUB_ERROR* ✿ ━━━━━┓\n┃\n┃ ❌ *USER NOT FOUND*\n┃ 📱 *PHONE:* ${senderPhone}\n┃\n┃ _Register on the hub first!_\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                    edit: wait.key 
                });
            }

            // --- 5. LIMITS & BALANCE ---
            const DAILY_MAX = 10000;
            const spentToday = (check.history || [])
                .filter(tx => tx.type === "WITHDRAW" && new Date(tx.date).toDateString() === new Date().toDateString())
                .reduce((sum, tx) => sum + (tx.amount || 0), 0);

            if (spentToday + Number(amount) > DAILY_MAX) {
                return sock.sendMessage(from, { 
                    text: `❌ *LIMIT:* Daily limit is KSH ${DAILY_MAX}. You spent KSH ${spentToday}.`,
                    edit: wait.key 
                });
            }

            if (Number(check.balance) < Number(amount)) {
                return sock.sendMessage(from, { text: `❌ *INSUFFICIENT:* Balance: KSH ${check.balance}`, edit: wait.key });
            }

            // --- 6. DISBURSEMENT ---
            const res = await hubClient.withdraw(targetPhone, amount, truncatedName);

            if (res && res.success) {
                const finalReceipt = `┏━━━━━ ✿ *V_HUB_SUCCESS* ✿ ━━━━━┓\n┃\n┃ ✅ *TRANSACTION COMPLETE*\n┃ 💵 *AMOUNT:* KSH ${amount}\n┃ 📱 *SENT TO:* ${targetPhone}\n┃ 🧾 *REF:* ${res.receipt || 'HUB-TX'}\n┃ 🏦 *BAL:* KSH ${res.newBalance}\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
                await sock.sendMessage(from, { text: finalReceipt, edit: wait.key });
            } else {
                throw new Error(res?.message || "Gateway Offline");
            }

        } catch (err) {
            console.error("┃ ❌ PAY_ERROR:", err.message);
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *V_HUB_STATUS* ✿ ━━━━━┓\n┃\n┃ ❌ *SYSTEM ERROR*\n┃ ⚠️ *LOG:* ${err.message}\n┃\n┃ _Report this to Admin!_\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
            });
        }
    }
};
