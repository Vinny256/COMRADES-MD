module.exports = {
    name: 'unblock',
    category: 'owner',
    desc: 'Unblock a user on WhatsApp',
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;

        // 1. Identify target
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const target = quoted || (args[0] && args[0].includes('@') ? args[0] : null);

        if (!target) {
            return sock.sendMessage(from, { text: "✿ *Usage:* Reply to a user with `.unblock` or provide JID. ✿" });
        }

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

        try {
            await sock.updateBlockStatus(target, "unblock");
            
            const name = target.split('@')[0];
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *RESTORE* ✿ ━━━━━┓\n┃\n┃ ✅ *Status:* User Unblocked\n┃ 👤 *Target:* @${name}\n┃ 🔓 *Notice:* Access restored.\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [target]
            });
        } catch (e) {
            sock.sendMessage(from, { text: "❌ *Error:* Could not unblock the user." });
        }
    }
};