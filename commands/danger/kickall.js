module.exports = {
    name: "kickall",
    category: "danger",
    desc: "V_HUB PROTOCOL: Total Group Purge",

    async execute(sock, msg, args, { from, isMe, prefix }) {

        const sender = msg.key.participant || msg.key.remoteJid;

        // ─────────────────────────────
        // 1️⃣ OWNER ONLY
        // ─────────────────────────────
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "⚠️", key: msg.key } });
            return sock.sendMessage(from, {
                text:
`┏━━━━━ ✿ *V_HUB SECURITY* ✿ ━━━━━┓
┃
┃ 🛡️ *Protocol:* Restricted (Nuclear)
┃ 👤 *User:* @${sender.split('@')[0]}
┃ ⚠️ *Note:* You do not have the
┃      clearance for this protocol.
┃
┃ _Integrity Shield Active._
┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // ─────────────────────────────
        // 2️⃣ GROUP ONLY CHECK
        // ─────────────────────────────
        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, {
                text: "⚠️ This command can only be used inside a group."
            }, { quoted: msg });
        }

        // ─────────────────────────────
        // 3️⃣ FETCH GROUP METADATA
        // ─────────────────────────────
        let metadata;
        try {
            metadata = await sock.groupMetadata(from);
        } catch (err) {
            return sock.sendMessage(from, {
                text: "❌ Failed to fetch group metadata."
            });
        }

        const participants = metadata.participants || [];

        // ─────────────────────────────
        // 4️⃣ BOT ADMIN CHECK (FIXED)
        // ─────────────────────────────
        const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const botEntry = participants.find(p => p.id === botJid);

        const botIsAdmin =
            botEntry?.admin === "admin" ||
            botEntry?.admin === "superadmin";

        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, {
                text:
`┏━━━━━ ✿ *V_HUB ERROR* ✿ ━━━━━┓
┃
┃ ❌ *Status:* Bot is not Admin
┃ 🛑 Cannot execute purge.
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`
            });
        }

        // ─────────────────────────────
        // 5️⃣ FILTER TARGETS
        //    - Protect bot
        //    - Protect sender (owner)
        //    - Protect admins
        // ─────────────────────────────
        const toRemove = participants
            .filter(p =>
                p.id !== botJid &&
                p.id !== sender &&
                !p.admin // do not try removing admins
            )
            .map(p => p.id);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, {
                text:
`┏━━━━━ ✿ *V_HUB INFO* ✿ ━━━━━┓
┃
┃ 👥 No removable targets found.
┃ 🛡️ Admins & Owner Protected.
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`
            });
        }

        // ─────────────────────────────
        // 6️⃣ START PURGE
        // ─────────────────────────────
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });

        await sock.sendMessage(from, {
            text:
`┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓
┃
┃ ☢️ *PROTOCOL:* Nuclear Purge
┃ 👥 *Targets:* ${toRemove.length}
┃ ⚡ *Mode:* Controlled Execution
┃
┃ _Standby..._
┗━━━━━━━━━━━━━━━━━━━━━━┛`
        });

        // ─────────────────────────────
        // 7️⃣ BACKGROUND REMOVAL
        // ─────────────────────────────
        (async () => {

            let removedCount = 0;

            for (let jid of toRemove) {
                try {
                    await sock.groupParticipantsUpdate(from, [jid], "remove");
                    removedCount++;

                    // Update every 20 removals
                    if (removedCount % 20 === 0) {
                        await sock.sendMessage(from, {
                            text:
`┏━━━━━ ✿ *PURGE UPDATE* ✿ ━━━━━┓
┃
┃ 🛡️ Removed: ${removedCount}
┃ ⏳ Remaining: ${toRemove.length - removedCount}
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`
                        });
                    }

                    // Safe delay (avoid WhatsApp rate-limit)
                    await new Promise(res => setTimeout(res, 3000));

                } catch (err) {
                    console.log("Failed to remove:", jid, err.message);
                }
            }

            await sock.sendMessage(from, {
                text:
`┏━━━━━ ✿ *PURGE COMPLETE* ✿ ━━━━━┓
┃
┃ ✅ Total Purged: ${removedCount}
┃ 🔄 Group Stabilized.
┃
┃ _Vinnie Hub Protocol Finished._
┗━━━━━━━━━━━━━━━━━━━━━━┛`
            });

        })();

    }
};
