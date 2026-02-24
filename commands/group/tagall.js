module.exports = {
    name: "tagall",
    category: "group",
    desc: "Tag everyone in the group",
    async execute(sock, msg, args, { from, isMe }) {
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin).map(p => p.id);
        const sender = msg.key.participant || from;
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ Only Admins can tag everyone." });

        const message = args.join(" ") || "No message provided";
        let txt = `📢 *ATTENTION EVERYONE*\n\n💬 *Message:* ${message}\n\n`;
        
        for (let mem of participants) {
            txt += `🔹 @${mem.id.split('@')[0]}\n`;
        }

        await sock.sendMessage(from, { 
            text: txt, 
            mentions: participants.map(p => p.id) 
        });
    }
};