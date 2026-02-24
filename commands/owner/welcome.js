module.exports = {
    name: "welcome",
    category: "owner",
    desc: "Toggle welcome messages for groups",
    async execute(sock, msg, args, { from, isMe, settings }) {
        if (!isMe) return; // Owner only
        
        await sock.sendMessage(from, { react: { text: "👋", key: msg.key } });
        const action = args[0]?.toLowerCase(); // 'on', 'off'
        const target = args[1]; // Group JID or 'all'

        if (!action) return sock.sendMessage(from, { text: "❓ Usage: *.welcome on/off* (in group) or *.welcome on/off [jid/all]* (in inbox)" });

        // --- Logic for 'ALL' Groups ---
        if (target === "all") {
            settings.welcome = (action === "on");
            // We use a global toggle in settings for "All"
            await global.saveSettings();
            return sock.sendMessage(from, { text: `┏━━ ✿ *GLOBAL SETTING* ✿ ━━┓\n┃\n┃ 👋 Welcome: *${action.toUpperCase()}*\n┃ 🌍 Applied to: *All Groups*\n┃\n┗━━━━━━━━━━━━━━┛` });
        }

        // --- Logic for Specific Group ---
        const groupJid = target || from; 
        if (!groupJid.endsWith('@g.us')) return sock.sendMessage(from, { text: "❌ Please provide a valid Group JID or use this in a group." });

        // Store per-group settings in your DB
        const { MongoClient } = require("mongodb");
        const client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        await client.db("vinnieBot").collection("group_configs").updateOne(
            { groupId: groupJid },
            { $set: { welcome: (action === "on") } },
            { upsert: true }
        );

        const groupName = (await sock.groupMetadata(groupJid)).subject;
        await sock.sendMessage(from, { 
            text: `┏━━ ✿ *GROUP SETTING* ✿ ━━┓\n┃\n┃ 👋 Welcome: *${action.toUpperCase()}*\n┃ 🏛️ Group: *${groupName}*\n┃\n┗━━━━━━━━━━━━━━┛` 
        });
    }
};