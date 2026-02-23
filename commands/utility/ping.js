const os = require('os');

module.exports = {
    name: 'ping',
    category: 'utility',
    desc: 'Check bot speed and system status',
    async execute(sock, msg, args, { from, isMe }) {
        // 1. Calculate Latency
        const start = Date.now();
        const timestamp = msg.messageTimestamp;
        const now = Math.floor(Date.now() / 1000);
        const networkSpeed = now - timestamp; // Speed from WA Server to Bot
        
        // 2. Prepare System Info
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

        // 3. Craft the Styling (Non-Boring)
        const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        const pingBody = [
            `┃  🛰️ *NETWORK:* ${networkSpeed}s RTT`,
            `┃  🧠 *ENGINE:* ${Date.now() - start}ms`,
            `┃  🔋 *UPTIME:* ${hours}h ${minutes}m ${seconds}s`,
            `┃  📊 *MEMORY:* ${ram}MB / ${totalRam}GB`,
            `┃  📡 *NODE:* ${process.version}`,
            `┃  🛡️ *SHIELD:* ACTIVE`
        ].join('\n');

        // 4. Send with Reaction for Feedback
        await sock.sendMessage(from, { react: { text: "⚡", key: msg.key } });
        
        await sock.sendMessage(from, { 
            text: vStyle(pingBody),
            contextInfo: {
                externalAdReply: {
                    title: "V_HUB TERMINAL STATUS",
                    body: "System Performance Optimized",
                    previewType: "PHOTO",
                    thumbnailUrl: "https://i.ibb.co/vzP6N1H/vhub-logo.png", // Optional: your logo link
                    sourceUrl: ""
                }
            }
        }, { quoted: msg });
    }
};