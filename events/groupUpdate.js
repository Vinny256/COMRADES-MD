sock.ev.on('group-participants.update', async (anu) => {
    const { id, participants, action } = anu;
    const metadata = await sock.groupMetadata(id);
    
    // Check Database for this specific group's toggle
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const config = await client.db("vinnieBot").collection("group_configs").findOne({ groupId: id });
    const globalSettings = fs.readJsonSync('./settings.json');

    // Logic: Welcome if Group-Specific is ON OR Global is ON
    if (action === 'add' && (config?.welcome || globalSettings.welcome)) {
        for (let num of participants) {
            let welcomeTxt = `┏━━━━ ✿ *WELCOME* ✿ ━━━━┓\n┃\n┃ 👋 Hello @${num.split('@')[0]}!\n┃ 🏛️ Welcome to *${metadata.subject}*\n┃\n┃ ✨ Read the rules and enjoy!\n┗━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(id, { text: welcomeTxt, mentions: [num] });
        }
    }

    if (action === 'remove' && (config?.goodbye || globalSettings.goodbye)) {
        for (let num of participants) {
            let byeTxt = `┏━━━━ ✿ *GOODBYE* ✿ ━━━━┓\n┃\n┃ ✨ Goodbye @${num.split('@')[0]}\n┃ 🥀 We will miss you!\n┗━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(id, { text: byeTxt, mentions: [num] });
        }
    }
});