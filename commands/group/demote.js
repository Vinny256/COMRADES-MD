module.exports = {
    name: "demote",
    category: "group",
    desc: "Remove Admin privileges from a user",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || from;
        const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ *Admin Only command.*" });
        if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ I need to be an Admin to demote others." });

        let users = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            users.push(msg.message.extendedTextMessage.contextInfo.participant);
        }

        if (!users.length) return sock.sendMessage(from, { text: "❓ Tag or reply to the Admin you want to demote." });

        await sock.groupParticipantsUpdate(from, users, "demote");
        await sock.sendMessage(from, { text: `🎖️ Admin powers removed from the user(s).` });
    }
};