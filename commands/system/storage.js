import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ESM DIRNAME REPLACEMENT ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storageCommand = {
    name: "storage",
    description: "Check bot storage usage with Elite Hub style.",
    category: "system",
    async execute(sock, msg, args, { from }) {
        
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "📊", key: msg.key } });

        // Recursive function to get size in bytes
        const getDirSize = (dirPath) => {
            let size = 0;
            if (!fs.existsSync(dirPath)) return 0;
            const files = fs.readdirSync(dirPath);
            for (let i = 0; i < files.length; i++) {
                const filePath = path.join(dirPath, files[i]);
                try {
                    const stats = fs.statSync(filePath);
                    if (stats.isFile()) size += stats.size;
                    else if (stats.isDirectory()) size += getDirSize(filePath);
                } catch (e) {
                    continue; // Skip files that are locked or inaccessible
                }
            }
            return size;
        };

        // --- 📁 TARGET PATHS ---
        const authPath = path.join(__dirname, '../../auth_temp'); 
        const assetsPath = path.join(__dirname, '../../assets');  

        // Calculate Sizes in MB
        const authSize = (getDirSize(authPath) / 1024 / 1024).toFixed(2);
        const assetsSize = (getDirSize(assetsPath) / 1024 / 1024).toFixed(2);
        const totalSize = (parseFloat(authSize) + parseFloat(assetsSize)).toFixed(2);

        // --- 🛠️ STATUS LOGIC ---
        let status = "ʜᴇᴀʟᴛʜʏ ✅";
        let statusColor = "ᴀᴄᴛɪᴠᴇ";
        if (totalSize > 500) { status = "ᴡᴀʀɴɪɴɢ ⚠️"; statusColor = "ᴄᴀᴜᴛɪᴏɴ"; }
        if (totalSize > 2000) { status = "ᴄʀɪᴛɪᴄᴀʟ 🚨"; statusColor = "ᴅᴀɴɢᴇʀ"; }

        // --- 📑 ANALYTICS UI CONSTRUCTION ---
        let storageLog = `┌────────────────────────┈\n`;
        storageLog += `│      *ᴠ-ʜᴜʙ_sʏsᴛᴇᴍ_ʟᴏɢ* \n`;
        storageLog += `└────────────────────────┈\n\n`;
        
        storageLog += `┌─『 sᴛᴏʀᴀɢᴇ_ᴀɴᴀʟʏᴛɪᴄs 』\n`;
        storageLog += `│ 📂 *sᴇssɪᴏɴ:* ${authSize} ᴍʙ\n`;
        storageLog += `│ 🎵 *ᴀssᴇᴛs:* ${assetsSize} ᴍʙ\n`;
        storageLog += `│ 📊 *ᴛᴏᴛᴀʟ:* ${totalSize} ᴍʙ\n`;
        storageLog += `│ 🛠️ *sᴛᴀᴛᴜs:* ${status}\n`;
        storageLog += `└────────────────────────┈\n\n`;
        
        storageLog += `_“ᴋᴇᴇᴘɪɴɢ ᴛʜᴇ ᴠᴀᴜʟᴛ ᴏᴘᴛɪᴍɪᴢᴇᴅ...”_`;

        await sock.sendMessage(from, { 
            text: storageLog,
            contextInfo: {
                externalAdReply: {
                    title: `sʏsᴛᴇᴍ_ʜᴇᴀʟᴛʜ: ${statusColor.toUpperCase()}`,
                    body: `ᴜsᴀɢᴇ: ${totalSize} ᴍʙ | sᴛᴀᴛᴜs: ${status}`,
                    thumbnailUrl: "https://vinnie-digital-hub.vercel.app/logo.png",
                    sourceUrl: "https://vinnie-digital-hub.vercel.app",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: msg });
    }
};

export default storageCommand;
