module.exports = {
    name: "kickall",
    category: "danger",
    desc: "V_HUB PROTOCOL: Group Purge",
    async execute(sock, msg, args, { from, isMe, participants, prefix }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // --- 1. NON-OWNER CUSTOM REPLY ---
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *ACCESS DENIED* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Level:* Unauthorized\n┃ 👤 *User:* @${sender.split('@')[0]}\n┃ ⚠️ *Warning:* This is a Danger Command.\n┃\n┃ _Only the Core Developer can initiate._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // --- 2. ADMIN CHECK ---
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const botIsAdmin = participants.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin'));
        
        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { text: "✿ *V_HUB ERROR* ✿\n\nI need **Admin Rights** to execute this protocol." });
        }

        // --- 3. FILTERING TARGETS ---
        // Exclude the bot and the owner (you)
        const toRemove = participants
            .map(p => p.id)
            .filter(id => id !== botId && id !== sender);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, { text: "✿ *V_HUB INFO* ✿\n\nScan complete. No external members found." });
        }

        // --- 4. EXECUTION PROTOCOL ---
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });
        
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ ⚠️ *PROTOCOL:* Nuclear Purge\n┃ 👥 *Target Count:* ${toRemove.length}\n┃ ⏱️ *Est. Time:* ${toRemove.length}s\n┃\n┃ _Initiating sequence..._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        for (let participant of toRemove) {
            try {
                await sock.groupParticipantsUpdate(from, [participant], "remove");
                // 1-second safety delay
                await new Promise(res => setTimeout(res, 1000)); 
            } catch (e) {
                console.error(`Purge Failed for: ${participant}`);
            }
        }

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
        await sock.sendMessage(from, { text: "✿ *PROTOCOL COMPLETE* ✿\n\nGroup has been successfully purged. 🔄" });
    }
};
