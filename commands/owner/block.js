module.exports = {
    name: 'block',
    category: 'owner',
    desc: 'Block a user from WhatsApp',
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;

        // 1. Identify the target (Quoted message or JID in args)
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const target = quoted || (args[0] && args[0].includes('@') ? args[0] : null);

        if (!target) {
            return sock.sendMessage(from, { text: "✿ *Usage:* Reply to a user with `.block` or provide their JID. ✿" });
        }

        await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });

        try {
            await sock.updateBlockStatus(target, "block");
            
            const name = target.split('@')[0];
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *LOCKDOWN* ✿ ━━━━━┓\n┃\n┃ 🚫 *Status:* User Blocked\n┃ 👤 *Target:* @${name}\n┃ 🔒 *Scope:* Global WhatsApp\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [target]
            });
        } catch (e) {
            sock.sendMessage(from, { text: "❌ *Error:* Could not complete the block request." });
        }
    }
};