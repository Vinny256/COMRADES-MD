const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

const vStyle = (text) => {
    return `┏━━━━━ ✿ *SETTINGS* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = {
    name: 'setwelcome',
    category: 'owner',
    desc: 'Set custom welcome message',
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;
        
        const text = args.join(" ");
        if (!text) return sock.sendMessage(from, { text: vStyle("Usage: .setwelcome Welcome to our group @user!") });

        await sock.sendMessage(from, { react: { text: "📝", key: msg.key } });

        // Logic to determine if we are setting it for 'this' group or a specific JID
        const targetJid = args.find(a => a.endsWith('@g.us')) || from;

        await client.connect();
        await client.db("vinnieBot").collection("group_configs").updateOne(
            { groupId: targetJid },
            { $set: { welcomeText: text } },
            { upsert: true }
        );

        await sock.sendMessage(from, { text: vStyle(`✅ *Welcome Text Updated*\n┃ Group: ${targetJid.split('@')[0]}\n┃ Text: ${text}`) });
    }
};