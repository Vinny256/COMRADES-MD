module.exports = {
    name: "warn",
    category: "group",
    desc: "Give a warning strike to a user",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || from;
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ Admins only." });

        let user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                   msg.message.extendedTextMessage?.contextInfo?.participant;

        if (!user) return sock.sendMessage(from, { text: "❓ Reply to or tag a user to warn them." });

        await sock.sendMessage(from, { react: { text: "⚠️", key: msg.key } });

        // Logic: You would typically store this in MongoDB. 
        // For now, let's assume we are just notifying.
        const warnMsg = `┏━━━━━ ✿ *WARNING* ✿ ━━━━━┓
┃
┃ 👤 *User:* @${user.split('@')[0]}
┃ ⚠️ *Action:* Strike Issued
┃ 📝 *Reason:* ${args.join(" ") || "No reason provided"}
┃
┃ 🛡️ _3 strikes will result in a kick._
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sock.sendMessage(from, { text: warnMsg, mentions: [user] });
    }
};