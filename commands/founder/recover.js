const recoverCommand = {
    name: "recover",
    category: "founder",
    desc: "V_HUB: Vault Retrieval with LID Mapping",
    async execute(sock, msg, args, { from, client, logsCollection }) {
        // --- 🛡️ IDENTITY EXTRACTION ---
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const numberFromJid = senderJid.split("@")[0].split(":")[0]; 
        const ownerNumber = process.env.OWNER_NUMBER;

        console.log(`🔍 [RECOVER] Triggered by: ${senderJid}`);

        // --- 🛡️ FOUNDER SHIELD ---
        if (!ownerNumber || !numberFromJid.includes(ownerNumber)) {
            console.log(`⛔ [RECOVER] Access Denied: ${numberFromJid}`);
            return; // Silent block for security
        }

        // --- 💾 DATABASE SELECTION ---
        const db = client?.db ? client.db("vinnieBot") : (logsCollection?.db || logsCollection?.database);
        const relayVault = db.collection("relay_vault");
        const lidsCollection = db.collection("lids_map");

        try {
            // Initial Reaction
            await sock.sendMessage(from, { react: { text: "🔓", key: msg.key } });

            // ---- 📝 LID MAPPING & CLEANUP ----
            const now = new Date();
            await lidsCollection.updateOne(
                { number: numberFromJid },
                { $set: { lid: senderJid, updatedAt: now } },
                { upsert: true }
            );

            // Cleanup: Remove LIDs older than 30 days
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30);
            await lidsCollection.deleteMany({ updatedAt: { $lt: cutoff } });

            // ---- 📥 FETCH VAULT DATA ----
            const data = await relayVault.find({}).sort({ createdAt: -1 }).limit(1).toArray();

            if (!data || data.length === 0) {
                return await sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴠᴀᴜʟᴛ_sᴛᴀᴛᴜs:* ᴇᴍᴘᴛʏ\n└────────────────────────┈` 
                });
            }

            // ---- 📊 PREMIUM REPORT UI ----
            let reportMsg = `┌────────────────────────┈\n`;
            reportMsg += `│      *ᴠᴀᴜʟᴛ_ʀᴇᴄᴏᴠᴇʀʏ* \n`;
            reportMsg += `└────────────────────────┈\n\n`;
            reportMsg += `┌─『 ᴅᴀᴛᴀ_ʀᴇᴛʀɪᴇᴠᴇᴅ 』\n`;
            reportMsg += `│ ${data[0].report}\n`;
            reportMsg += `└────────────────────────┈\n\n`;
            reportMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: reportMsg });

            // ---- 🗑️ AUTO-STEALTH CLEANUP ----
            setTimeout(async () => {
                try {
                    await sock.sendMessage(from, { delete: msg.key });
                    console.log("🗑️ [RECOVER] Command purged from chat.");
                } catch (err) { /* Silent fail */ }
            }, 1000);

        } catch (e) {
            console.error("⚠️ [RECOVER_ERR]:", e.message);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ${e.message}\n└────────────────────────┈` 
            });
        }
    }
};

export default recoverCommand;
