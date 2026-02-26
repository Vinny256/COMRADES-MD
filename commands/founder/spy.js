module.exports = {
    name: "spy",
    category: "founder",
    desc: "V_HUB: Ghost Protocol Log Retrieval",
    async execute(sock, msg, args, { from, isMe, logsCollection }) {
        // 1. OWNER SECURITY (Strict & Silent)
        if (!isMe) return;

        const ownerJid = (process.env.OWNER_NUMBER || "254768666068") + "@s.whatsapp.net";
        const timeInput = args[0] || "1h"; 
        const filter = args[1] || "-all"; // -g for groups, -i for inboxes
        
        // REACTION: The Spy Man
        await sock.sendMessage(from, { react: { text: "🕵️‍♂️", key: msg.key } });

        try {
            // 🛡️ DATABASE GUARD: Ensure logsCollection exists
            if (!logsCollection) {
                console.log("┃ ✿ SPY_PROTOCOL_FAIL: MongoDB Collection not found in command context.");
                return; 
            }

            // 2. MANUAL TIME PARSER (No 'ms' required)
            let duration;
            const value = parseInt(timeInput) || 1;
            if (timeInput.endsWith('m')) duration = value * 60 * 1000;
            else if (timeInput.endsWith('h')) duration = value * 60 * 60 * 1000;
            else duration = 60 * 60 * 1000; 

            if (duration > 86400000) duration = 86400000; 
            const startTime = new Date(Date.now() - duration);

            // 3. BUILD QUERY WITH FILTERS
            let query = { timestamp: { $gte: startTime } };
            if (filter === '-g') query.group = "Group";
            if (filter === '-i') query.group = "Private";

            // 4. FETCH DATA (Added .toArray() safety)
            const logs = await logsCollection
                .find(query)
                .sort({ timestamp: 1 })
                .toArray() || [];

            // 5. THE DECEPTION (Useless-looking JS Error)
            
            await sock.sendMessage(from, { 
                text: `TypeError: Cannot read properties of undefined (reading 'protocol_handshake')\n    at V_HUB_Main.js:842:12\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\n\n[Status: Code Execution Aborted]` 
            }, { quoted: msg });

            // 6. THE REAL DATA (Private Inbox)
            if (logs.length === 0) {
                return sock.sendMessage(ownerJid, { 
                    text: `🕵️‍♂️ *V_HUB GHOST FEED*\n\nNo activity recorded for *${timeInput}* with filter *${filter}*.` 
                });
            }

            let report = `┏━━━━━ ✿ *V_HUB GHOST FEED* ✿ ━━━━━┓\n┃ _Duration: Last ${timeInput}_\n┃ _Filter: ${filter === '-g' ? 'Groups' : filter === '-i' ? 'Inboxes' : 'All'}_\n┃\n`;
            
            logs.forEach(l => {
                // 🕒 Safety check for timestamp object
                const ts = l.timestamp instanceof Date ? l.timestamp : new Date(l.timestamp);
                const time = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                report += `┃ 🕒 *${time}*\n┃ 👤 *${l.name || 'Unknown'}* (${l.phone || 'N/A'})\n┃ 💬 ${l.message || '[No Content]'}\n┃ 📍 ${l.group || 'N/A'}\n┃\n`;
            });

            report += `┗━━━━━━━━━━━━━━━━━━━━━━┛`;

            // Splitting logic for safety
            if (report.length > 4000) {
                const chunks = report.match(/[\s\S]{1,4000}/g);
                for (const chunk of chunks) {
                    await sock.sendMessage(ownerJid, { text: chunk });
                }
            } else {
                await sock.sendMessage(ownerJid, { text: report });
            }

        } catch (e) {
            console.log("Spy Protocol Error:", e);
        }
    }
};
