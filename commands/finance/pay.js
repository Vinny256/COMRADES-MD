const hubClient = require('../../utils/hubClient');

module.exports = {
    name: 'pay',
    category: 'finance',
    async execute(conn, m, args) {
        const sock = conn?.sendMessage ? conn : (m.conn || global.conn);
        const remoteJid = m?.key?.remoteJid;
        if (!remoteJid) return; // Silent exit if no JID

        try {
            // --- 1. SAFE IDENTITY EXTRACTION (CRASH PREVENTION) ---
            const sender = m.sender || m.key.participant || m.key.remoteJid;
            const senderPhone = sender ? sender.split('@')[0] : null;
            
            if (!senderPhone) throw new Error("Could not identify sender.");

            const rawName = m.pushName || "V_Hub_Member";
            
            // SECURITY: Anonymous Check
            if (rawName === "V_Hub_Member" || rawName.includes("V_Hub_Member")) {
                return sock.sendMessage(remoteJid, { 
                    text: "┏━━━━━ ✿ *V_HUB_SECURITY* ✿ ━━━━━┓\n┃\n┃ ❌ *ACCESS DENIED*\n┃ 👤 *USER:* V_Hub_Member\n┃\n┃ _For safety, unnamed accounts_\n┃ _cannot withdraw funds._\n┃\n┃ 💡 *FIX:* Set a name in WhatsApp.\n┗━━━━━━━━━━━━━━━━━━━━━━┛" 
                }, { quoted: m });
            }

            const truncatedSenderName = rawName.length > 12 ? rawName.substring(0, 12) + ".." : rawName;
            const amount = args[0];
            let phone = args[1];

            // --- 2. VALIDATION ---
            if (!amount || isNaN(amount) || !phone) {
                return sock.sendMessage(remoteJid, { text: "❌ *Usage:* `.pay <amount> <phone>`" }, { quoted: m });
            }
            if (Number(amount) < 10) {
                return sock.sendMessage(remoteJid, { text: "⚠️ *V_HUB:* Minimum withdrawal is KSH 10." }, { quoted: m });
            }
            if (phone.startsWith('0')) phone = '254' + phone.slice(1);

            const msg = await sock.sendMessage(remoteJid, { text: "⏳ *V_HUB:* Running security checks..." }, { quoted: m });

            // --- 3. DATABASE & LIMIT CHECKS ---
            const check = await hubClient.checkStatus(senderPhone);

            if (!check || check.status !== "OK") {
                return sock.sendMessage(remoteJid, { text: "❌ *V_HUB:* User not found in database.", edit: msg.key });
            }

            const today = new Date().toDateString();
            const DAILY_MAX = 10000;
            
            const spentToday = (check.history || [])
                .filter(tx => tx.type === "WITHDRAW" && new Date(tx.date).toDateString() === today)
                .reduce((sum, tx) => sum + (tx.amount || 0), 0);

            if (spentToday + Number(amount) > DAILY_MAX) {
                return sock.sendMessage(remoteJid, { 
                    text: `┏━━━━━ ✿ *LIMIT_REACHED* ✿ ━━━━━┓\n┃\n┃ ❌ *DAILY LIMIT EXCEEDED*\n┃ 👤 *USER:* ${truncatedSenderName}\n┃ 📉 *SPENT TODAY:* KSH ${spentToday}\n┃ 🚫 *LIMIT:* KSH ${DAILY_MAX}\n┃\n┃ _Try a smaller amount or wait 24h._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                    edit: msg.key 
                });
            }

            if (Number(check.balance) < Number(amount)) {
                return sock.sendMessage(remoteJid, { text: `❌ *INSUFFICIENT:* Balance is KSH ${check.balance}.`, edit: msg.key });
            }

            // --- 4. EXECUTION ---
            const res = await hubClient.withdraw(phone, amount, truncatedSenderName);

            if (res && res.success) {
                const limitLeft = DAILY_MAX - (spentToday + Number(amount));
                
                const finalReceipt = `┏━━━━━ ✿ *V_HUB_SUCCESS* ✿ ━━━━━┓
┃
┃ ✅ *TRANSFER DISBURSED!*
┃ 👤 *DEAR:* ${truncatedSenderName}
┃ 💵 *DEBITED:* KSH ${amount}
┃ 📱 *RECIPIENT:* ${phone}
┃ 🧾 *REF:* ${res.receipt || 'B2C_OK'}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🏦 *NEW BAL:* KSH ${res.newBalance}
┃ 🕒 *LIMIT LEFT:* KSH ${limitLeft}
┃
┃ _Infinite Impact - Vinnie Hub_
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sock.sendMessage(remoteJid, { text: finalReceipt, edit: msg.key });
            } else {
                throw new Error(res?.message || "M-Pesa Gateway Timeout");
            }

        } catch (err) {
            console.error("┃ ❌ PAY_COMMAND_CRASH_PREVENTED:", err.message);
            // Notify user of error without killing the process
            if (remoteJid) {
                await sock.sendMessage(remoteJid, { 
                    text: `┏━━━━━ ✿ *V_HUB_ERROR* ✿ ━━━━━┓\n┃\n┃ ❌ *SYSTEM ALERT*\n┃ ⚠️ *REASON:* ${err.message}\n┃\n┃ _Bot recovered automatically._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
                });
            }
        }
    }
};