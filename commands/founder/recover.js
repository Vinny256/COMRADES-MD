module.exports = {
    name: "recover",
    category: "founder",
    desc: "V_HUB: Vault Retrieval",
    async execute(sock, msg, args, { from, isMe, client, logsCollection }) {
        // 🔒 Only you
        if (!isMe) return;

        // 🛡️ THE MASTERPIECE DB RESOLVER
        // We check every possible location for the database connection
        const db = client?.db ? client.db("vinnieBot") : (logsCollection?.db || logsCollection?.database || (client?.connection?.db));
        
        if (!db) {
            return await sock.sendMessage(from, { text: "⚠️ *DB Error:* Could not connect to MongoDB. Check your URI." });
        }

        const relayVault = db.collection("relay_vault");

        try {
            await sock.sendMessage(from, { react: { text: "🔓", key: msg.key } });

            // 1. PULL LATEST LOG
            const data = await relayVault.find({}).sort({ createdAt: -1 }).limit(1).toArray();

            if (!data || data.length === 0) {
                return await sock.sendMessage(from, { text: "❌ *Vault Empty:* No logs saved in MongoDB yet." });
            }

            // 2. SEND TO OWNER (YOU)
            await sock.sendMessage(from, { 
                text: `🔓 *V_HUB RECOVERY SUCCESS*\n_Latest Entry: ${new Date(data[0].createdAt).toLocaleString()}_\n\n${data[0].report}` 
            });

            // 3. AUTO-CLEANUP
            setTimeout(async () => {
                await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
            }, 2000);

        } catch (e) {
            console.error("Recovery Fail:", e.message);
            await sock.sendMessage(from, { text: `⚠️ *Recovery Failed:* ${e.message}` });
        }
    }
};
