const { MongoClient } = require("mongodb");
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

module.exports = {
    name: "totalmsg",
    category: "group",
    desc: "Show the most active members in the group",
    async execute(sock, msg, args, { from }) {
        await sock.sendMessage(from, { react: { text: "📈", key: msg.key } });

        try {
            const db = client.db("vinnieBot");
            const collection = db.collection("message_counts");

            // Fetch top 10 most active members
            const topMembers = await collection.find({ groupId: from })
                .sort({ count: -1 })
                .limit(10)
                .toArray();

            if (topMembers.length === 0) {
                return sock.sendMessage(from, { text: "⚠️ No activity data recorded yet." });
            }

            let leaderboard = `┏━━━━━ ✿ *ACTIVITY BOARD* ✿ ━━━━━┓\n┃\n`;
            
            topMembers.forEach((user, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🔹";
                leaderboard += `┃ ${medal} @${user.userId.split('@')[0]}: *${user.count} msgs*\n`;
            });

            leaderboard += `┃\n┃ ✨ _Keep chatting to climb!_\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

            await sock.sendMessage(from, { 
                text: leaderboard, 
                mentions: topMembers.map(u => u.userId) 
            });

        } catch (e) {
            await sock.sendMessage(from, { text: "❌ Database error occurred." });
        }
    }
};