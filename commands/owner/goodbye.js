module.exports = {
    name: "goodbye",
    category: "owner",
    desc: "Toggle goodbye messages",
    async execute(sock, msg, args, { from, isMe, settings }) {
        if (!isMe) return;
        
        await sock.sendMessage(from, { react: { text: "✨", key: msg.key } });
        const action = args[0]?.toLowerCase();
        const target = args[1];

        if (target === "all") {
            settings.goodbye = (action === "on");
            await global.saveSettings();
            return sock.sendMessage(from, { text: "✅ Goodbye messages toggled for *ALL* groups." });
        }

        const groupJid = target || from;
        if (!groupJid.endsWith('@g.us')) return;

        const { MongoClient } = require("mongodb");
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        await client.db("vinnieBot").collection("group_configs").updateOne(
            { groupId: groupJid },
            { $set: { goodbye: (action === "on") } },
            { upsert: true }
        );

        await sock.sendMessage(from, { text: `✅ Goodbye toggled *${action}* for this group.` });
    }
};