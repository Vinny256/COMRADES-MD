const { MongoClient } = require("mongodb");

// Using the same URI from your process.env
const client = new MongoClient(process.env.MONGO_URI || "");

module.exports = {
    name: ['autoreply', 'ai'],
    category: 'automation',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const senderJid = m.key.participant || from;
        const senderId = senderJid.split('@')[0];
        
        // Connect to your vinnieBot database
        const db = client.db("vinnieBot");
        const configColl = db.collection("ai_config");

        // 1. Show Status if no args are provided
        if (args.length === 0) {
            const current = await configColl.findOne({ id: senderId }) || { status: 'off', scope: 'inbox' };
            const menu = `┏━━━━━━ 💠 *V_HUB AI* ━━━━━━┓
┃ 
┃ *STATUS:* ${current.status === 'on' ? '✅ ACTIVE' : '❌ DISABLED'}
┃ *SCOPE:* ${current.scope === 'all' ? '🌍 ALL CHATS' : '📩 INBOX ONLY'}
┃ 
┣━━━━━━━━━━━━━━━━━━━━━━
┃ *COMMANDS:*
┃ 📑 *.autoreply on*
┃ 📑 *.autoreply off*
┃ 📑 *.autoreply inbox* (DM Only)
┃ 📑 *.autoreply all* (Groups + DM)
┃ 
┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            return sock.sendMessage(from, { text: menu }, { quoted: m });
        }

        const input = args[0].toLowerCase();
        let updateData = {};

        // 2. Logic for Toggling and Scoping
        if (input === 'on') {
            updateData.status = 'on';
        } else if (input === 'off') {
            updateData.status = 'off';
        } else if (input === 'inbox') {
            updateData.status = 'on';
            updateData.scope = 'inbox';
        } else if (input === 'all') {
            updateData.status = 'on';
            updateData.scope = 'all';
        } else {
            return sock.sendMessage(from, { text: "⚠️ *V_HUB:* Invalid option. Use *on, off, inbox,* or *all*." });
        }

        // 3. Save to MongoDB
        await configColl.updateOne(
            { id: senderId }, 
            { $set: updateData }, 
            { upsert: true }
        );

        const successMsg = `✨ *V_HUB CONFIG UPDATED* ✨\n\nAI is now *${updateData.status || 'Active'}* for *${updateData.scope || 'selected'}* chats.`;
        await sock.sendMessage(from, { text: successMsg }, { quoted: m });
    }
};
