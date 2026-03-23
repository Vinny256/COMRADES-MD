import os from 'os';

const pingCommand = {
    name: 'ping',
    category: 'utility',
    desc: 'Check bot speed and system status',
    async execute(sock, msg, args, { from, isMe }) {
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "⚡", key: msg.key } });

        // 1. Calculate Latency Metrics
        const start = Date.now();
        const timestamp = msg.messageTimestamp;
        const nowSec = Math.floor(Date.now() / 1000);
        const networkSpeed = nowSec - timestamp; // Speed from WA Server to Bot
        
        // 2. Prepare System Metrics
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const engineSpeed = Date.now() - start;

        // --- 📑 STATUS UI CONSTRUCTION ---
        let pingLog = `┌────────────────────────┈\n`;
        pingLog += `│      *ᴠ-ʜᴜʙ_sʏsᴛᴇᴍ_ᴘᴜʟsᴇ* \n`;
        pingLog += `└────────────────────────┈\n\n`;
        
        pingLog += `┌─『 ᴘᴇʀғᴏʀᴍᴀɴᴄᴇ_ᴍᴇᴛʀɪᴄs 』\n`;
        pingLog += `│ 🛰️ *ɴᴇᴛᴡᴏʀᴋ:* ${networkSpeed}s ʀᴛᴛ\n`;
        pingLog += `│ 🧠 *ᴇɴɢɪɴᴇ:* ${engineSpeed}ᴍs\n`;
        pingLog += `│ 🔋 *ᴜᴘᴛɪᴍᴇ:* ${hours}ʜ ${minutes}ᴍ ${seconds}s\n`;
        pingLog += `│ 📊 *ᴍᴇᴍᴏʀʏ:* ${ramUsed}ᴍʙ / ${totalRam}ɢʙ\n`;
        pingLog += `│ 📡 *ɴᴏᴅᴇ:* ${process.version}\n`;
        pingLog += `│ 🛡️ *sʜɪᴇʟᴅ:* ᴏᴘᴛɪᴍɪᴢᴇᴅ_ᴀᴄᴛɪᴠᴇ\n`;
        pingLog += `└────────────────────────┈\n\n`;
        
        pingLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        // 4. Send with Enhanced Context Info
        await sock.sendMessage(from, { 
            text: pingLog,
            contextInfo: {
                externalAdReply: {
                    title: "V_HUB TERMINAL STATUS",
                    body: `ʟᴀᴛᴇɴᴄʏ: ${engineSpeed}ᴍs | sʏsᴛᴇᴍ: ᴏɴʟɪɴᴇ`,
                    previewType: "PHOTO",
                    thumbnailUrl: "https://i.ibb.co/vzP6N1H/vhub-logo.png",
                    sourceUrl: "https://vinnie-digital-hub.vercel.app",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: msg });
    }
};

export default pingCommand;
