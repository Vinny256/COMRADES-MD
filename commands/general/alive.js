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
                audio: { url: audioPath }, // Use URL/Path instead of ReadFileSync for better memory
                mimetype: 'audio/mpeg',    // Changed to mpeg for .mp3 files
                ptt: true,                 // Sends as a playable voice note
                waveform: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90] // Optional: adds visual wave
            }, { quoted: msg });
        } else {
            console.error(`┃ ❌ Audio file missing at: ${audioPath}`);
            await sock.sendMessage(from, { text: "⚠️ Audio file 'play.mp3' not found in assets folder." });
        }
    }
};