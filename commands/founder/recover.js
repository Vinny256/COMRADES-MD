module.exports = {
    name: "recover",
    category: "founder",
    desc: "V_HUB: Latest Vault Retrieval",
    async execute(sock, msg, args, { from, isMe, client, logsCollection }) {
        // 🔒 SECURITY: Only you can trigger the recovery
        if (!isMe) return;

        // 🛡️ DB RESOLUTION
        const db = client?.db ? client.db("vinnieBot") : (logsCollection?.db || logsCollection?.database);
        const relayVault = db?.collection("relay_vault");

        if (!relayVault) {
            return await sock.sendMessage(from, { text: "⚠️ *System Error:* Vault collection unreachable." });
        }

        try {
            // 1. SIGNAL: Unlock reaction
            await sock.sendMessage(from, { react: { text: "🔓", key: msg.key } });

            // 2. FETCH ONLY THE LATEST (1) DOCUMENT
            // Sort by 'createdAt' in descending order (-1) and limit to 1
            const latestEntry = await relayVault.find({}).sort({ createdAt: -1 }).limit(1).toArray();

            if (latestEntry.length === 0) {
                return await sock.sendMessage(from, { text: "❌ *Vault Empty:* No recent logs found." });
            }

            const data = latestEntry[0];

            // 3. SECURE DELIVERY
            await sock.sendMessage(from, { 
                text: `🔓 *V_HUB LATEST RETRIEVAL*\n_Timestamp: ${new Date(data.createdAt).toLocaleString()}_\n\n${data.report}` 
            });

            // 4. CLEANUP: Delete the trigger command
            setTimeout(async () => {
                await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
            }, 1500);

        } catch (e) {
            console.error("Recovery Fail:", e.message);
            await sock.sendMessage(from, { text: `⚠️ *Recovery Error:* ${e.message}` });
        }
    }
};
