const fs = require('fs');
const path = require('path');

module.exports = {
    name: "storage",
    description: "Check bot storage usage with Comrade style.",
    category: "system",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // Recursive function to get size in bytes
        const getDirSize = (dirPath) => {
            let size = 0;
            if (!fs.existsSync(dirPath)) return 0;
            const files = fs.readdirSync(dirPath);
            for (let i = 0; i < files.length; i++) {
                const filePath = path.join(dirPath, files[i]);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) size += stats.size;
                else if (stats.isDirectory()) size += getDirSize(filePath);
            }
            return size;
        };

        // --- PATHS ---
        const authPath = path.join(__dirname, '../../auth_temp'); // Your session folder
        const assetsPath = path.join(__dirname, '../../assets');   // Your media folder

        // Calculate Sizes in MB
        const authSize = (getDirSize(authPath) / 1024 / 1024).toFixed(2);
        const assetsSize = (getDirSize(assetsPath) / 1024 / 1024).toFixed(2);
        const totalSize = (parseFloat(authSize) + parseFloat(assetsSize)).toFixed(2);

        // Status Logic
        let status = "HEALTHY ✅";
        if (totalSize > 500) status = "WARNING ⚠️";
        if (totalSize > 2000) status = "CRITICAL 🚨";

        const storageText = `┏━━━━━ ✿ *COMRADE-STORAGE* ✿ ━━━━━┓
┃
┃ 📂 *SESSION (AUTH):* ${authSize} MB
┃ 🎵 *ASSETS/MEDIA:* ${assetsSize} MB
┃ 📊 *TOTAL USAGE:* ${totalSize} MB
┃ 🛠️ *SYSTEM STATUS:* ${status}
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛
_“Keeping your storage lean and clean...”_`;

        await sock.sendMessage(from, { 
            text: storageText,
            contextInfo: {
                externalAdReply: {
                    title: "STORAGE ANALYTICS",
                    body: `Total: ${totalSize} MB | Status: ${status}`,
                    thumbnailUrl: "https://vinnie-digital-hub.vercel.app/logo.png",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: msg });
    }
};