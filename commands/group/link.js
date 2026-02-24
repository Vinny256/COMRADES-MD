module.exports = {
    name: "link",
    category: "group",
    desc: "Get the group invite link",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || from;
        const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
        
        if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ I need admin status to fetch the link." });

        await sock.sendMessage(from, { react: { text: "🔗", key: msg.key } });

        const code = await sock.groupInviteCode(from);
        const linkMsg = `┏━━━━━ ✿ *INVITE LINK* ✿ ━━━━━┓\n┃\n┃ 🖇️ *Link:* \n┃ https://chat.whatsapp.com/${code}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sock.sendMessage(from, { text: linkMsg });
    }
};