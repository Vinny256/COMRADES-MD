module.exports = {
    name: "me",
    category: "group",
    desc: "Check your personal group stats",
    async execute(sock, msg, args, { from }) {
        const sender = msg.key.participant || from;
        await sock.sendMessage(from, { react: { text: "👤", key: msg.key } });

        const db = client.db("vinnieBot");
        const userData = await db.collection("message_counts").findOne({ groupId: from, userId: sender });

        const stats = `┏━━━━━ ✿ *YOUR STATS* ✿ ━━━━━┓
┃
┃ 👤 *User:* @${sender.split('@')[0]}
┃ 📊 *Total Messages:* ${userData ? userData.count : 0}
┃ 🏆 *Rank:* _Calculated daily_
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sock.sendMessage(from, { text: stats, mentions: [sender] });
    }
};