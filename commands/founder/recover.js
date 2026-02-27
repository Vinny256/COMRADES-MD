module.exports = {
    name: "recover",
    category: "founder",
    desc: "V_HUB: Vault Retrieval with LID Mapping",
    async execute(sock, msg, args, { from, client, logsCollection }) {

        // Extract sender info
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const numberFromJid = senderJid.includes("@lid")
            ? senderJid.split("@")[0] // Extract number from LID
            : senderJid.split("@")[0];

        console.log("🔍 RECOVER TRIGGERED");
        console.log("Sender:", senderJid);

        // Owner number from ENV
        const ownerNumber = process.env.OWNER_NUMBER;
        if (!ownerNumber) {
            console.log("⛔ OWNER NUMBER NOT SET. COMMAND BLOCKED.");
            return;
        }

        // Only owner can run
        if (!numberFromJid.includes(ownerNumber)) {
            console.log(`⛔ Not owner. Blocking command. Sender: ${numberFromJid}, Owner: ${ownerNumber}`);
            return;
        }

        console.log("✅ Owner verified:", numberFromJid);

        const db = client?.db ? client.db("vinnieBot") : (logsCollection?.db || logsCollection?.database);
        const relayVault = db.collection("relay_vault");
        const lidsCollection = db.collection("lids_map"); // New collection for LID → number

        try {
            // React to indicate command received
            await sock.sendMessage(from, { react: { text: "🔓", key: msg.key } });

            // ---- LID MAPPING ----
            const now = new Date();
            await lidsCollection.updateOne(
                { number: numberFromJid },
                { $set: { lid: senderJid, updatedAt: now } },
                { upsert: true }
            );

            console.log(`💾 LID saved/updated: ${senderJid} → ${numberFromJid}`);

            // ---- CLEANUP: Remove LIDs older than 30 days ----
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30);
            const result = await lidsCollection.deleteMany({ updatedAt: { $lt: cutoff } });
            console.log(`🗑️ Old LIDs cleaned: ${result.deletedCount}`);

            // ---- FETCH VAULT DATA ----
            const data = await relayVault.find({}).sort({ createdAt: -1 }).limit(1).toArray();

            if (!data || data.length === 0) {
                return await sock.sendMessage(from, { text: "❌ *Vault Empty.*" });
            }

            // Send the recovered report
            await sock.sendMessage(from, { 
                text: `🔓 *V_HUB RECOVERY*\n\n${data[0].report}`
            });

            console.log("✅ Vault report sent to owner");

            // Optionally delete the command after 1s
            setTimeout(() => {
                sock.sendMessage(from, { delete: msg.key }).catch(() => {});
                console.log("🗑️ Command message deleted");
            }, 1000);

        } catch (e) {
            console.error("⚠️ Recover error:", e);
            await sock.sendMessage(from, { text: `⚠️ *Recover Error:* ${e.message}` });
        }
    }
};
