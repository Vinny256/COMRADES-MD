module.exports = {
    name: "hidetag",
    category: "group",
    desc: "Mention everyone without showing the tag list",
    async execute(sock, msg, args, { from, isMe }) {
        // 1. Fetch group details
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin).map(p => p.id);
        
        // 2. Permission Check: Only Admins can trigger the bot to tag everyone
        const sender = msg.key.participant || from;
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ *Admin Only:* You cannot trigger a hidetag." });

        // 3. React with unique emoji
        await sock.sendMessage(from, { react: { text: "👻", key: msg.key } });

        // 4. Prepare the Message
        const announcement = args.join(" ") || "Attention everyone!";
        
        const styledMsg = `┏━━━━━ ✿ *ANNOUNCEMENT* ✿ ━━━━━┓
┃
┃ 📢 ${announcement}
┃
┃ ✨ _Broadcast to all members_
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        // 5. Send with HIDDEN mentions
        // The bot sends the list of all IDs in the 'mentions' array. 
        // Everyone gets a notification, but no names appear in the text.
        await sock.sendMessage(from, { 
            text: styledMsg, 
            mentions: participants.map(p => p.id) 
        });
    }
};