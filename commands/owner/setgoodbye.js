module.exports = {
    name: 'setgoodbye',
    category: 'owner',
    desc: 'Set custom goodbye message',
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;

        const text = args.join(" ");
        if (!text) return sock.sendMessage(from, { text: vStyle("Usage: .setgoodbye @user left the chat.") });

        await sock.sendMessage(from, { react: { text: "🥀", key: msg.key } });

        const targetJid = args.find(a => a.endsWith('@g.us')) || from;

        await client.connect();
        await client.db("vinnieBot").collection("group_configs").updateOne(
            { groupId: targetJid },
            { $set: { goodbyeText: text } },
            { upsert: true }
        );

        await sock.sendMessage(from, { text: vStyle(`✅ *Goodbye Text Updated*\n┃ Group: ${targetJid.split('@')[0]}\n┃ Text: ${text}`) });
    }
};