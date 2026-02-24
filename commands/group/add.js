module.exports = {
    name: "add",
    category: "group",
    desc: "Add a member to the group",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        
        const sender = msg.key.participant || from;
        const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ *Admin Only:* You can't add members." });
        if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ *Error:* I need to be an Admin to add members." });

        if (!args[0]) return sock.sendMessage(from, { text: "❓ *Usage:* .add 254xxx..." });

        const user = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        
        try {
            await sock.groupParticipantsUpdate(from, [user], "add");
            await sock.sendMessage(from, { text: `✅ Added @${user.split('@')[0]} to the group!`, mentions: [user] });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ *Failed:* User might have privacy settings enabled. Try sending them the invite link instead." });
        }
    }
};