module.exports = {
    name: "kickall",
    category: "danger",
    desc: "V_HUB PROTOCOL: Total Group Purge",

    async execute(sock, msg, args, { from, isMe, prefix }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // 1️⃣ OWNER-ONLY ACCESS SHIELD (The '例' Reaction)
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "例", key: msg.key } });
            return sock.sendMessage(from, {
                text: `┏━━━━━ ✿ *V_HUB SECURITY* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Protocol:* Restricted (Nuclear)\n┃ 👤 *User:* @${sender.split('@')[0]}\n┃ ⚠️ *Note:* This command is for the \n┃      Core Developer only.\n┃\n┃ _System integrity maintained._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // 2️⃣ GROUP CHECK
        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, { text: "⚠️ This protocol requires a Group environment." });
        }

        // 3️⃣ FETCH DATA
        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];

        // 4️⃣ BOT ADMIN CHECK (LID-Safe Logic)
        const botNumber = sock.user.id.replace(/\D/g, ''); 
        const botEntry = participants.find(p => (p.id || "").includes(botNumber) || (p.pn || "").includes(botNumber));
        
        const botIsAdmin = botEntry && (botEntry.admin === 'admin' || botEntry.admin === 'superadmin');

        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { 
                text: "✿ *V_HUB ERROR* ✿\n\nI cannot execute the purge. I am not recognized as an **Admin** in this group registry." 
            });
        }

        // 5️⃣ FILTER TARGETS (PROTECTS: Bot, Owner, and ALL Admins)
        const toRemove = participants
            .filter(p => 
                p.id !== botEntry.id && // Protect Bot
                p.id !== sender &&      // Protect Owner (You)
                !p.admin                // Protect other Admins
            )
            .map(p => p.id);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, { 
                text: "┏━━━━━ ✿ *V_HUB INFO* ✿ ━━━━━┓\n┃\n┃ 👥 No removable targets found.\n┃ 🛡️ Admins & Owner Protected.\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛" 
            });
        }

        // 6️⃣ INITIATION (Nuclear Reaction)
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });
        await sock.sendMessage(from, {
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ ☢️ *PROTOCOL:* Nuclear Purge\n┃ 👥 *Targets:* ${toRemove.length}\n┃ ⚡ *Status:* background_exec\n┃\n┃ _Warning: This action is final._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
        });

        // 7️⃣ BACKGROUND EXECUTION (Non-Blocking)
        (async () => {
            let removedCount = 0;
            for (let jid of toRemove) {
                try {
                    await sock.groupParticipantsUpdate(from, [jid], "remove");
                    removedCount++;

                    // Status Update every 20 members
                    if (removedCount % 20 === 0) {
                        await sock.sendMessage(from, {
                            text: `┏━━━━━ ✿ *PURGE UPDATE* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Removed:* ${removedCount}\n┃ ⏳ *Remaining:* ${toRemove.length - removedCount}\n┃ ⚡ *Note:* Remaining members to\n┃      Face the Music...\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
                        });
                    }
                    // 2.5s delay to keep your account safe from WhatsApp bans
                    await new Promise(res => setTimeout(res, 2500)); 
                } catch (e) {
                    console.log(`[V_HUB] Failed to remove ${jid}:`, e.message);
                }
            }

            // FINAL REPORT
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
            await sock.sendMessage(from, {
                text: `┏━━━━━ ✿ *PURGE COMPLETE* ✿ ━━━━━┓\n┃\n┃ ✅ *Total Purged:* ${removedCount}\n┃ 🔄 *Status:* Group Stabilized.\n┃\n┃ _Vinnie Hub Protocol Finished._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`
            });
        })(); 
    }
};
