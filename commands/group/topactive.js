const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

module.exports = {
    name: 'topactive',
    category: 'group',
    desc: 'Shows the leaderboard of most active members',
    async execute(sock, msg, args, { from }) {
        if (!from.endsWith('@g.us')) return;

        await sock.sendMessage(from, { react: { text: "👑", key: msg.key } });

        try {
            const db = client.db("vinnieBot");
            const activity = db.collection("activity_stats");

            // Fetch top 10 users for this group
            const topUsers = await activity.find({ groupId: from })
                .sort({ count: -1 })
                .limit(10)
                .toArray();

            if (topUsers.length === 0) {
                return sock.sendMessage(from, { text: "✿ No activity recorded yet. Start chatting! ✿" });
            }

            let leaderboard = `┏━━━━━ ✿ *LEADERBOARD* ✿ ━━━━━┓\n┃\n`;
            
            topUsers.forEach((user, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "✨";
                leaderboard += `┃ ${medal} *${index + 1}.* ${user.name}\n┃ 💌 Messages: ${user.count}\n┃\n`;
            });

            leaderboard += `┗━━━━━━━━━━━━━━━━━━━━━━┛`;

            await sock.sendMessage(from, { text: leaderboard });

        } catch (e) {
            console.error(e);
            sock.sendMessage(from, { text: "❌ Error fetching leaderboard." });
        }
    }
};