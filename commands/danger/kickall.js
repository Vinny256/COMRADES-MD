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
                text: `┏━━━━━ ✿ *V_HUB SECURITY* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Protocol:* Restricted (Nuclear)\n┃ 👤 *User:* @${sender.split('@')[0]}\n┃ ⚠️ *Note:* You do not have the\n┃      clearance for this protocol.\n┃\n┃ _Integrity Shield Active._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // 2️⃣ GROUP ONLY CHECK
        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, { text: "⚠️ This command can only be used inside a group." }, { quoted: msg });
        }

        // 3️⃣ FETCH METADATA
        let metadata;
        try {
            metadata = await sock.groupMetadata(from);
        } catch (err) {
            return sock.sendMessage(from, { text: "❌ Failed to fetch group metadata." });
        }

        const participants = metadata.participants || [];

        // ─────────────────────────────
        // 4️⃣ BOT ADMIN CHECK (LID-SAFE)
        // ─────────────────────────────
        // Extract digits to find the bot regardless of JID or LID format
        const botNumber = sock.user.id.replace(/\D/g, ''); 
        const botEntry = participants.find(p => p.id.includes(botNumber));

        if (!botEntry || !botEntry.admin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, {
                text: `┏━━━━━ ✿ *V_HUB ERROR* ✿ ━━━━━┓\n┃\n┃ ❌ *Status:* Bot is not Admin\n┃ 🛑 Cannot execute purge.\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
            });
        }

        // ─────────────────────────────
        // 5️⃣ FILTER TARGETS
        // ─────────────────────────────
        const toRemove = participants
            .filter(p => 
                p.id !== botEntry.id && // Protect bot's actual group ID
                p.id !== sender &&      // Protect you
                !p.admin                // Protect other admins
            )
            .map(p => p.id);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, {
                text: `┏━━━━━ ✿ *V_HUB INFO* ✿ ━━━━━┓\n┃\n┃ 👥 No removable targets found.\n┃ 🛡️ Admins & Owner Protected.\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
            });
        }

        // 6️⃣ START PURGE
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });
        await sock.sendMessage(from, {
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ ☢️ *PROTOCOL:* Nuclear Purge\n┃ 👥 *Targets:* ${toRemove.length}\n┃ ⚡ *Mode:* Controlled Execution\n┃\n┃ _Standby..._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
        });

        // 7️⃣ BACKGROUND REMOVAL
        (async () => {
            let removedCount = 0;
            for (let jid of toRemove) {
                try {
                    await sock.groupParticipantsUpdate(from, [jid], "remove");
                    removedCount++;

                    if (removedCount % 20 === 0) {
                        await sock.sendMessage(from, {
                            text: `┏━━━━━ ✿ *PURGE UPDATE* ✿ ━━━━━┓\n┃\n┃ 🛡️ Removed: ${removedCount}\n┃ ⏳ Remaining: ${toRemove.length - removedCount}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
                        });
                    }
                    await new Promise(res => setTimeout(res, 3000));
                } catch (err) {
                    console.log("Failed to remove:", jid, err.message);
                }
            }

            await sock.sendMessage(from, {
                text: `┏━━━━━ ✿ *PURGE COMPLETE* ✿ ━━━━━┓\n┃\n┃ ✅ Total Purged: ${removedCount}\n┃ 🔄 Group Stabilized.\n┃\n┃ _Vinnie Hub Protocol Finished._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
            });
        })();
    }
};
