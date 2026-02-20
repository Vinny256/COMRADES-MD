const { delay } = require("@whiskeysockets/baileys");
const path = require('path');
const fs = require('fs');

module.exports = {
    name: "alive",
    description: "Check bot status with Alan Walker - Play.",
    category: "general",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // --- 📂 LOCAL FILE PATH ---
        // Make sure you place your song in: assets/play.mp3
        const audioPath = path.join(__dirname, '../../assets/play.mp3');

        const aliveText = `┏━━━━━ ✿ *COMRADE-MD* ✿ ━━━━━┓
┃
┃ ✅ *STATUS:* ONLINE
┃ 🎵 *NOW PLAYING:* Play - Alan Walker
┃ 👤 *HOST:* Vinnie Hub
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛
_“We used to hide under the covers...”_`;

        // 1. Send the Status Text
        await sock.sendMessage(from, { 
            text: aliveText,
            contextInfo: {
                externalAdReply: {
                    title: "SYSTEM OPERATIONAL",
                    body: "Alan Walker - Play (Comrade Edition)",
                    thumbnailUrl: "https://vinnie-digital-hub.vercel.app/logo.png",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

        // 2. Check if file exists before sending to prevent crash
        if (fs.existsSync(audioPath)) {
            await delay(1500);
            await sock.sendMessage(from, { 
                audio: fs.readFileSync(audioPath), 
                mimetype: 'audio/mp4', 
                ptt: true 
            }, { quoted: msg });
        } else {
            console.error(`┃ ❌ Audio file missing at: ${audioPath}`);
            // Fallback message if you forgot to upload the file
            await sock.sendMessage(from, { text: "⚠️ Audio file 'play.mp3' not found in assets folder." });
        }
    }
};