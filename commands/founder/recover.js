module.exports = {
    name: "recover",
    category: "founder",
    desc: "V_HUB: Vault Retrieval",

    async execute(sock, msg, args, { from, client, logsCollection }) {

        // 🛡️ OWNER CHECK (Multi-Device Safe)
        if (!msg.key.fromMe) {
            console.log("⛔ Not owner. Blocking command.");
            return;
        }

        console.log("🔓 RECOVER TRIGGERED BY OWNER");

        const db = client?.db 
            ? client.db("vinnieBot") 
            : (logsCollection?.db || logsCollection?.database);

        if (!db) {
            console.log("❌ Database missing.");
            return await sock.sendMessage(from, {
                text: "⚠️ *Database connection missing.*"
            });
        }

        const relayVault = db.collection("relay_vault");

        try {

            // React immediately
            await sock.sendMessage(from, {
                react: { text: "🔓", key: msg.key }
            });

            console.log("📦 Fetching latest vault entry...");

            const data = await relayVault
                .find({})
                .sort({ createdAt: -1 })
                .limit(1)
                .toArray();

            console.log("📊 Vault result:", data);

            if (!data || data.length === 0) {
                console.log("⚠ Vault empty.");
                return await sock.sendMessage(from, {
                    text: "❌ *Vault Empty.*"
                });
            }

            if (!data[0].report) {
                console.log("⚠ report field missing.");
                return await sock.sendMessage(from, {
                    text: "⚠️ *No report found in latest vault entry.*"
                });
            }

            console.log("✅ Sending report...");

            await sock.sendMessage(from, {
                text: `🔓 *V_HUB RECOVERY*\n\n${data[0].report}`
            });

            console.log("🎉 Report sent successfully.");

            // Delete command after 1 second
            setTimeout(() => {
                sock.sendMessage(from, { delete: msg.key }).catch(() => {});
            }, 1000);

        } catch (e) {
            console.error("💥 RECOVER ERROR:", e);
        }
    }
};
