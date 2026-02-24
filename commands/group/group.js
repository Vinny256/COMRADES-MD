module.exports = {
    name: "group",
    category: "group",
    desc: "Open or close the group chat",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || from;
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ Admins only." });
        if (!args[0]) return sock.sendMessage(from, { text: "❓ Use: *.group open* or *.group close*" });

        const action = args[0].toLowerCase();

        if (action === 'open') {
            await sock.sendMessage(from, { react: { text: "🔓", key: msg.key } });
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { text: "🔓 Group opened! All members can now send messages." });
        } else if (action === 'close') {
            await sock.sendMessage(from, { react: { text: "🔒", key: msg.key } });
            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, { text: "🔒 Group closed! Only admins can send messages." });
        } else {
            await sock.sendMessage(from, { text: "❓ Invalid option. Use *open* or *close*." });
        }
    }
};