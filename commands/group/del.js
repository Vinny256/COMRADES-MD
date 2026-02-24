module.exports = {
    name: "del",
    category: "group",
    desc: "Delete a message by replying to it",
    async execute(sock, msg, args, { from, isMe }) {
        // 1. Fetch group details for permission check
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
        
        const sender = msg.key.participant || from;
        const isAdmin = admins.includes(sender) || isMe;

        // 2. Permission Check
        if (!isAdmin) return sock.sendMessage(from, { text: "❌ *Admin Only:* You cannot delete messages." });
        
        // 3. Check if replying to a message
        const quoted = msg.message.extendedTextMessage?.contextInfo;
        if (!quoted || !quoted.stanzaId) {
            return sock.sendMessage(from, { text: "❓ *Usage:* Reply to the message you want to delete with *.del*" });
        }

        // 4. React & Execute
        await sock.sendMessage(from, { react: { text: "🗑️", key: msg.key } });

        // The logic to delete a message involves sending a protocol message
        await sock.sendMessage(from, {
            delete: {
                remoteJid: from,
                fromMe: quoted.participant === sock.user.id.split(':')[0] + '@s.whatsapp.net',
                id: quoted.stanzaId,
                participant: quoted.participant
            }
        });

        // 5. Optional: Send a VHUB confirmation (Self-destructs or just logs)
        const delLog = `┏━━━━━ ✿ *MODERATION* ✿ ━━━━━┓
┃
┃ 🗑️ *Message Deleted*
┃ 👮 *Admin:* @${sender.split('@')[0]}
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sock.sendMessage(from, { text: delLog, mentions: [sender] });
    }
};