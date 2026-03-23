import baileys from "@whiskeysockets/baileys";
const { delay } = baileys;
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ESM fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const aliveCommand = {
    name: "alive",
    description: "Check bot status with Alan Walker - Play.",
    category: "general",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // --- 📂 LOCAL FILE PATH ---
        const audioPath = path.join(__dirname, '../../assets/play.mp3');

        // --- ⚡ UNICODE SLEEK STYLING ---
        const aliveText = `┌────────────────────────┈\n` +
                          `│      *ᴄᴏᴍʀᴀᴅᴇ-ᴍᴅ* \n` +
                          `└────────────────────────┈\n\n` +
                          `┌─『 sʏsᴛᴇᴍ ᴀʟɪᴠᴇ 』\n` +
                          `│ ⚙ *sᴛᴀᴛᴜs:* ᴏɴʟɪɴᴇ ✦\n` +
                          `│ ⚙ *ᴍᴜsɪᴄ:* ᴘʟᴀʏ - ᴀʟᴀɴ ᴡᴀʟᴋᴇʀ\n` +
                          `│ ⚙ *ʜᴏsᴛ:* ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ\n` +
                          `└────────────────────────┈\n\n` +
                          `_“ᴡᴇ ᴜsᴇᴅ ᴛᴏ ʜɪᴅᴇ ᴜɴᴅᴇʀ ᴛʜᴇ ᴄᴏᴠᴇʀs...”_`;

        // 1. Send the Status Text
        await sock.sendMessage(from, { 
            text: aliveText,
            contextInfo: {
                externalAdReply: {
                    title: "sʏsᴛᴇᴍ ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ",
                    body: "ᴀʟᴀɴ ᴡᴀʟᴋᴇʀ - ᴘʟᴀʏ (ᴄᴏᴍʀᴀᴅᴇ ᴇᴅɪᴛɪᴏɴ)",
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
                mimetype: 'audio/mpeg',    
                ptt: false,                
                fileName: 'Alan Walker - Play.mp3'
            }, { quoted: msg });
        } else {
            console.error(`┃ ❌ Audio file missing at: ${audioPath}`);
            await sock.sendMessage(from, { text: "⚠️ Audio file 'play.mp3' not found in assets folder." });
        }
    }
};

export default aliveCommand;
