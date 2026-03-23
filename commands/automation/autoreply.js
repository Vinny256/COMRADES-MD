const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI || "");

module.exports = {
    name: ['autoreply', 'ai'],
    category: 'automation',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const senderJid = m.key.participant || from;
        const senderNumber = senderJid.split('@')[0];
        const pushName = m.pushName || "User";
        
        const db = client.db("vinnieBot");
        const configColl = db.collection("ai_config");

        if (args.length === 0) {
            return sock.sendMessage(from, { text: "💠 *V_HUB AI*\nUsage: .autoreply on | off | inbox | all" });
        }

        const input = args[0].toLowerCase();
        let updateData = { updatedAt: new Date() };

        if (input === 'on') updateData.status = 'on';
        else if (input === 'off') updateData.status = 'off';
        else if (input === 'inbox') { updateData.status = 'on'; updateData.scope = 'inbox'; }
        else if (input === 'all') { updateData.status = 'on'; updateData.scope = 'all'; }
        else return sock.sendMessage(from, { text: "❌ Invalid option." });

        try {
            // --- THE FIX: Save to both Number AND Name to be 100% sure ---
            await configColl.updateOne({ id: senderNumber }, { $set: updateData }, { upsert: true });
            await configColl.updateOne({ id: pushName }, { $set: updateData }, { upsert: true });

            console.log(`✅ AI_CONFIG Saved for ${senderNumber} (${pushName}): ${input}`);
            
            await sock.sendMessage(from, { 
                text: `✨ *V_HUB AI UPDATED*\n\nStatus: *${updateData.status || 'on'}*\nScope: *${updateData.scope || 'all'}*` 
            }, { quoted: m });
        } catch (e) {
            console.error("Database Error:", e.message);
        }
    }
};
