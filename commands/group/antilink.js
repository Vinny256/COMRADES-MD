const fs = require('fs-extra');
const settingsFile = './settings.json';
const { MongoClient } = require("mongodb");
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const vStyle = (text) => {
    return `┏━━━━━ ✿ *MODERATION* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = {
    name: 'antilink',
    category: 'group',
    desc: 'Toggle link protection (Local, Specific, or Global)',
    async execute(sock, msg, args, { from, isMe, settings }) {
        const action = args[0]?.toLowerCase(); // 'on' or 'off'
        const target = args[1]; // JID or 'all'
        
        // 1. React with unique emoji
        await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });

        // 2. Global Toggle (Using "all") - Inbox only
        if (target === "all") {
            if (!isMe) return sock.sendMessage(from, { text: vStyle("Only the Bot Owner can use Global toggles.") });
            
            settings.antilink = (action === 'on');
            fs.writeJsonSync(settingsFile, settings); // Watchdog in index.js will push to Cloud
            
            return sock.sendMessage(from, { 
                text: vStyle(`🛡️ *GLOBAL ANTI-LINK*\n┃ Status: *${action.toUpperCase()}*\n┃ Scope: *All Groups*`) 
            });
        }

        // 3. Specific Group Toggle (Using JID in Inbox)
        if (target && target.endsWith('@g.us')) {
            if (!isMe) return;
            
            await client.connect();
            await client.db("vinnieBot").collection("group_configs").updateOne(
                { groupId: target },
                { $set: { antilink: (action === 'on') } },
                { upsert: true }
            );

            return sock.sendMessage(from, { 
                text: vStyle(`🛡️ *SPECIFIC ANTI-LINK*\n┃ Status: *${action.toUpperCase()}*\n┃ Group ID: ${target.split('@')[0]}`) 
            });
        }

        // 4. Local Group Toggle (Used inside a group)
        if (from.endsWith('@g.us')) {
            // Check if user is Admin
            const metadata = await sock.groupMetadata(from);
            const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
            const isAdmin = admins.includes(msg.key.participant || from) || isMe;

            if (!isAdmin) return sock.sendMessage(from, { text: vStyle("Access Denied. Admins only.") });

            if (action === 'on' || action === 'off') {
                await client.connect();
                await client.db("vinnieBot").collection("group_configs").updateOne(
                    { groupId: from },
                    { $set: { antilink: (action === 'on') } },
                    { upsert: true }
                );
                
                return sock.sendMessage(from, { 
                    text: vStyle(`🛡️ *ANTI-LINK ${action.toUpperCase()}*\n┃ Links are now ${action === 'on' ? '*Restricted*' : '*Allowed*'} here.`) 
                });
            }
        }

        // 5. Help Message if usage is wrong
        await sock.sendMessage(from, { 
            text: vStyle(`❓ *Usage Guide*\n┃\n┃ *Local:* .antilink on\n┃ *Global:* .antilink on all\n┃ *Target:* .antilink on [jid]`) 
        });
    }
};