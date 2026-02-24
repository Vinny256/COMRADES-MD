module.exports = {
    name: "setdesc",
    category: "group",
    desc: "Change the group description",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || from;
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ Admins only." });
        
        const newDesc = args.join(" ");
        await sock.sendMessage(from, { react: { text: "📝", key: msg.key } });

        await sock.groupUpdateDescription(from, newDesc);
        await sock.sendMessage(from, { text: `✅ Group description has been updated.` });
    }
};