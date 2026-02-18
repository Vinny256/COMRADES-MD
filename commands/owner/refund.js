const hubClient = require('../../utils/hubClient');

module.exports = {
    name: 'refund',
    category: 'owner',
    async execute(conn, m, args) {
        const sock = conn?.sendMessage ? conn : (m.conn || global.conn);
        const remoteJid = m.key.remoteJid;
        
        // --- 1. FOUNDER SECURITY ---
        const masterDirector = "254788032713@s.whatsapp.net";
        if (m.key.remoteJid !== masterDirector && !m.key.fromMe) return;

        const amount = args[0];
        let targetPhone = args[1];

        // --- 2. VALIDATION ---
        if (!amount || isNaN(amount) || !targetPhone) {
            return sock.sendMessage(remoteJid, { text: "❌ *Usage:* `.refund <amount> <phone>`" });
        }
        if (targetPhone.startsWith('0')) targetPhone = '254' + targetPhone.slice(1);

        const msg = await sock.sendMessage(remoteJid, { text: "🔍 *V_HUB:* Verifying member identity..." });

        try {
            // --- 3. DATABASE CHECK (Search by Phone) ---
            const userStatus = await hubClient.checkStatus(targetPhone);

            if (userStatus.status !== "OK") {
                return sock.sendMessage(remoteJid, { 
                    text: `┏━━━━━ ✿ *V_HUB_ERROR* ✿ ━━━━━┓\n┃\n┃ ❌ *NOT FOUND*\n┃ 👤 *USER:* ${targetPhone}\n┃\n┃ _This user is not in the database._\n┃ _They must .prompt first._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                    edit: msg.key 
                });
            }

            // --- 4. BALANCE CHECK ---
            if (userStatus.balance < Number(amount)) {
                return sock.sendMessage(remoteJid, { 
                    text: `┏━━━━━ ✿ *V_HUB_ERROR* ✿ ━━━━━┓\n┃\n┃ ❌ *LOW BALANCE*\n┃ 👤 *USER:* ${userStatus.v_hub_id || targetPhone}\n┃ 💰 *HAS:* KSH ${userStatus.balance}\n┃\n┃ _Cannot refund more than balance._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                    edit: msg.key 
                });
            }

            // --- 5. EXECUTE DISBURSEMENT ---
            // Passing the truncated name to the Proxy for the receipt
            const res = await hubClient.withdraw(targetPhone, amount, userStatus.v_hub_id);

            if (res.success) {
                const successMsg = `┏━━━━━ ✿ *V_HUB_REFUND* ✿ ━━━━━┓
┃
┃ ✅ *REFUND SUCCESSFUL!*
┃ 👤 *MEMBER:* ${userStatus.v_hub_id || targetPhone}
┃ 💰 *AMOUNT:* KSH ${amount}
┃ 🧾 *REF:* ${res.receipt}
┃
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🏦 *NEW BAL:* KSH ${res.newBalance}
┃ _Transaction logged as Manual Refund._
┃
┃ 🛠️ _Infinite Impact - Founder_
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                await sock.sendMessage(remoteJid, { text: successMsg, edit: msg.key });
            } else {
                throw new Error(res.message);
            }

        } catch (err) {
            await sock.sendMessage(remoteJid, { 
                text: `❌ *V_HUB_SYSTEM_FAILURE*\n\nReason: ${err.message}`,
                edit: msg.key 
            });
        }
    }
};