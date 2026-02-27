module.exports = {
    name: "recover",
    category: "founder",
    desc: "V_HUB: Vault Retrieval",

    async execute(sock, msg, args, { from, client, logsCollection }) {

        try {

            // 🌿 Primary owner (hard default)
            const defaultOwner = "254768666068";

            // 🌿 ENV override (if exists)
            const envOwner = process.env.OWNER_NUMBER;

            // 🌿 Use ENV if set, otherwise use default
            const activeOwner = envOwner && envOwner.trim() !== ""
                ? envOwner.trim()
                : defaultOwner;

            // 🌿 Fallback ONLY if activeOwner somehow fails
            const fallbackPrefix = "0768";

            // Proper sender detection
            const sender = msg.key.participant
                ? msg.key.participant
                : msg.key.remoteJid;

            console.log("🔍 RECOVER TRIGGERED");
            console.log("Sender:", sender);
            console.log("Active Owner:", activeOwner);

            if (!sender) {
                console.log("❌ No sender detected.");
                return;
            }

            let isOwner = false;

            // Primary check
            if (sender.includes(activeOwner)) {
                isOwner = true;
            }
            // Fallback check ONLY if primary fails
            else if (sender.includes(fallbackPrefix)) {
                console.log("⚠ Using fallback prefix 0768");
                isOwner = true;
            }

            if (!isOwner) {
                console.log("⛔ Not owner. Blocking command.");
                return;
            }

            const db = client?.db
                ? client.db("vinnieBot")
                : (logsCollection?.db || logsCollection?.database);

            if (!db) {
                console.log("❌ Database not found.");
                return await sock.sendMessage(from, {
                    text: "⚠️ *Database connection missing.*"
                });
            }

            const relayVault = db.collection("relay_vault");

            console.log("📦 Fetching latest vault entry...");

            const data = await relayVault
                .find({})
                .sort({ createdAt: -1 })
                .limit(1)
                .toArray();

            console.log("📊 Vault Data:", data);

            if (!data || data.length === 0) {
                console.log("⚠ Vault empty.");
                return await sock.sendMessage(from, {
                    text: "❌ *Vault Empty.*"
                });
            }

            if (!data[0].report) {
                console.log("⚠ No report field in document.");
                return await sock.sendMessage(from, {
                    text: "⚠️ *No report found in latest vault entry.*"
                });
            }

            console.log("✅ Sending report...");

            await sock.sendMessage(from, {
                text: `🔓 *V_HUB RECOVERY*\n\n${data[0].report}`
            });

            console.log("🎉 Report sent successfully.");

            await sock.sendMessage(from, {
                react: { text: "🔓", key: msg.key }
            });

        } catch (e) {
            console.log("💥 RECOVER ERROR:", e);
            await sock.sendMessage(from, {
                text: `⚠️ *DB Error:* ${e.message}`
            });
        }
    }
};
