module.exports = {
    name: "kickall",
    category: "danger",
    desc: "V_HUB PROTOCOL: Total Group Purge",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // --- 1. OWNER-ONLY ACCESS SHIELD ---
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *ACCESS DENIED* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Protocol:* Restricted\n┃ 👤 *User:* @${sender.split('@')[0]}\n┃ ⚠️ *Note:* This command is for the \n┃      Core Developer only.\n┃\n┃ _System integrity maintained._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // --- 2. FRESH ADMIN CHECK (REAL-TIME) ---
        // We fetch fresh metadata here to ensure the bot knows it's admin
        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const botIsAdmin = participants.some(p => p.id === botId && (p.admin === 'admin' || p.admin === 'superadmin'));
        
        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { 
                text: "✿ *V_HUB ERROR* ✿\n\nI cannot execute the purge. Please promote me to **Admin** first." 
            });
        }

        // --- 3. FILTERING TARGETS ---
        // We exclude the bot itself and YOU (the person who sent the command)
        const toRemove = participants
            .map(p => p.id)
            .filter(id => id !== botId && id !== sender);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, { text: "✿ *V_HUB INFO* ✿\n\nNo external members found to purge." });
        }

        // --- 4. EXECUTION PROTOCOL ---
        // React with 'Nuclear' emoji to show the process started
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });
        
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ ☢️ *PROTOCOL:* Nuclear Purge\n┃ 👥 *Members:* ${toRemove.length}\n┃ ⚡ *Status:* Initiating...\n┃\n┃ _Warning: This action is final._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        // Loop through participants with a 1-second delay to avoid WhatsApp Ban
        for (let jid of toRemove) {
            try {
                await sock.groupParticipantsUpdate(from, [jid], "remove");
                // Delay to stay under the radar
                await new Promise(res => setTimeout(res, 1000)); 
            } catch (e) {
                console.log(`Failed to remove: ${jid}`);
            }
        }

        // Final Reaction and Message
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
        await sock.sendMessage(from, { text: "✿ *PURGE COMPLETE* ✿\n\nThe group has been cleared. 🔄" });
    }
};
