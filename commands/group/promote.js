module.exports = {
    name: "promote",
    category: "group",
    desc: "Give a member Admin privileges",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || from;
        const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ *Admin Only command.*" });
        if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ I need to be an Admin to promote others." });

        let users = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            users.push(msg.message.extendedTextMessage.contextInfo.participant);
        }

        if (!users.length) return sock.sendMessage(from, { text: "❓ Tag or reply to the user you want to promote." });

        await sock.groupParticipantsUpdate(from, users, "promote");
        await sock.sendMessage(from, { text: `👑 User(s) promoted to Admin successfully.` });
    }
};