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
        const audioPath = path.join(__dirname, '../../assets/play.mp3');

        const aliveText = `┏━━━━━ ✿ *COMRADE-MD* ✿ ━━━━━┓
┃
┃ ✅ *STATUS:* ONLINE
┃ 🎵 *NOW PLAYING:* Play - Alan Walker
┃ 👤 *HOST:* Vinnie Hub
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛
_“We used to hide under the covers...”_`;

        // 1. Send the Status Text (Kept your logic exactly as is)
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

        // 2. SMART AUDIO SENDING
        if (fs.existsSync(audioPath)) {
            await delay(1500);
            await sock.sendMessage(from, { 
                audio: { url: audioPath }, 
                mimetype: 'audio/mpeg',    // Correct for .mp3
                ptt: false,                // CHANGED: Sending as music instead of voice note for better compatibility
                fileName: 'Alan Walker - Play.mp3'
            }, { quoted: msg });
        } else {
            console.error(`┃ ❌ Audio file missing at: ${audioPath}`);
            await sock.sendMessage(from, { text: "⚠️ Audio file 'play.mp3' not found in assets folder." });
        }
    }
};