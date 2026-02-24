module.exports = {
    name: "setname",
    category: "group",
    desc: "Change the group name",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || from;
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ Admins only." });
        if (!args[0]) return sock.sendMessage(from, { text: "❓ Provide a new name for the group." });

        const newName = args.join(" ");
        await sock.sendMessage(from, { react: { text: "✏️", key: msg.key } });
        
        await sock.groupUpdateSubject(from, newName);
        await sock.sendMessage(from, { text: `✅ Group name updated to: *${newName}*` });
    }
};