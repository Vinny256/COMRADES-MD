module.exports = {
    name: "recover",
    category: "founder",
    desc: "V_HUB: Vault Retrieval",
    async execute(sock, msg, args, { from, isMe, client, logsCollection }) {
        // 🔒 HARD LOCK: Only you can open the vault
        if (!isMe) return;

        // 🛡️ DB FAILSAFE: Inherit connection from logsCollection if client is undefined
        const db = client?.db ? client.db("vinnieBot") : (logsCollection?.db || logsCollection?.database);
        if (!db) return console.error("Vault Error: Database connection not found.");
        
        const relayVault = db.collection("relay_vault");

        try {
            // 1. SIGNAL & CLEANUP
            await sock.sendMessage(from, { react: { text: "🔓", key: msg.key } });
            
            // Delete your '.recover' command so no one sees you using it
            setTimeout(async () => {
                await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
            }, 1000);

            // 2. FETCH LATEST FROM VAULT
            // We sort by 'createdAt' descending to get the most recent report
            const lastReport = await relayVault.find().sort({ createdAt: -1 }).limit(1).toArray();

            if (lastReport.length === 0) {
                return await sock.sendMessage(from, { text: "⚠️ *Vault Empty:* No logs have been relayed in the last 24h." });
            }

            // 3. DELIVERY
            await sock.sendMessage(from, { 
                text: `🔓 *V_HUB VAULT UNLOCKED*\n_Retrieved: ${lastReport[0].createdAt.toLocaleString()}_\n\n${lastReport[0].report}` 
            });

        } catch (e) {
            console.error("Recovery Fail:", e.message);
        }
    }
};
