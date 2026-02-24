module.exports = {
    name: "groupinfo",
    category: "group",
    desc: "Get detailed group information",
    async execute(sock, msg, args, { from }) {
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin);
        const owner = metadata.owner || "Unknown";

        await sock.sendMessage(from, { react: { text: "📊", key: msg.key } });

        const infoMsg = `┏━━━━━ ✿ *GROUP INFO* ✿ ━━━━━┓
┃
┃ 🏷️ *Name:* ${metadata.subject}
┃ 🆔 *ID:* ${from.split('@')[0]}
┃ 👑 *Owner:* @${owner.split('@')[0]}
┃ 👥 *Members:* ${participants.length}
┃ 👮 *Admins:* ${admins.length}
┃ 📅 *Created:* ${new Date(metadata.creation * 1000).toDateString()}
┃
┃ 📝 *Description:* ┃ ${metadata.desc || "No description set."}
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sock.sendMessage(from, { 
            text: infoMsg, 
            mentions: [owner] 
        });
    }
};