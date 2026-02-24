module.exports = {
    name: "kick",
    category: "group",
    desc: "Remove a member from the group",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin).map(p => p.id);
        
        const sender = msg.key.participant || from;
        const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ *Admin Only:* You don't have permission to use this." });
        if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ *Error:* I need to be an Admin to kick members." });

        // Get the target: either mentioned, replied to, or typed via number
        let users = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
            users.push(msg.message.extendedTextMessage.contextInfo.participant);
        }
        if (args.length > 0 && !users.length) {
            users.push(args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        }

        if (!users.length) return sock.sendMessage(from, { text: "❓ *Usage:* Tag someone, reply to their message, or type their number to kick." });

        for (let user of users) {
            await sock.groupParticipantsUpdate(from, [user], "remove");
            await sock.sendMessage(from, { text: `👋 User @${user.split('@')[0]} has been removed.`, mentions: [user] });
        }
    }
};