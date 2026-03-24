import fs from 'fs-extra';
import { MongoClient } from "mongodb";

// --- 🛡️ DATABASE PERSISTENCE ---
// We initialize once to prevent "Too many connections" errors
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
let dbConnected = false;

const groupUpdateHandler = async (sock, anu) => {
    const { id, participants, action } = anu;

    try {
        // 1. Ensure DB Connection
        if (!dbConnected) {
            await client.connect();
            dbConnected = true;
        }

        // 2. Resource Gathering
        const metadata = await sock.groupMetadata(id).catch(() => ({ subject: "ᴛʜɪs_ɢʀᴏᴜᴘ" }));
        const config = await client.db("vinnieBot").collection("group_configs").findOne({ groupId: id });
        
        let globalSettings = { welcome: false, goodbye: false };
        if (fs.existsSync('./settings.json')) {
            globalSettings = fs.readJsonSync('./settings.json');
        }

        // --- 👋 WELCOME PROTOCOL ---
        if (action === 'add' && (config?.welcome || globalSettings.welcome)) {
            for (let num of participants) {
                let welcomeLog = `┌────────────────────────┈\n`;
                welcomeLog += `│      *ᴠ-ʜᴜʙ_ᴡᴇʟᴄᴏᴍᴇ* \n`;
                welcomeLog += `└────────────────────────┈\n\n`;
                
                welcomeLog += `┌─『 ɴᴇᴡ_ᴍᴇᴍʙᴇʀ_ᴀʟᴇʀᴛ 』\n`;
                welcomeLog += `│ 👋 ʜᴇʟʟᴏ: @${num.split('@')[0]}\n`;
                welcomeLog += `│ 🏛️ ɢʀᴏᴜᴘ: ${metadata.subject}\n`;
                welcomeLog += `│ ✨ sᴛᴀᴛᴜs: ᴊᴏɪɴᴇᴅ_sᴜᴄᴄᴇssғᴜʟ\n`;
                welcomeLog += `└────────────────────────┈\n\n`;
                
                welcomeLog += `_“ʀᴇᴀᴅ_ᴛʜᴇ_ʀᴜʟᴇs_ᴀɴᴅ_ᴇɴᴊᴏʏ_ᴛʜᴇ_sᴛᴀʏ”_`;

                await sock.sendMessage(id, { 
                    text: welcomeLog, 
                    mentions: [num],
                    contextInfo: {
                        externalAdReply: {
                            title: "V_HUB GROUP SYSTEM",
                            body: `Welcome to ${metadata.subject}`,
                            mediaType: 1,
                            thumbnailUrl: "https://vinnie-digital-hub.vercel.app/logo.png",
                            sourceUrl: "https://vinnie-digital-hub.vercel.app"
                        }
                    }
                });
            }
        }

        // --- 🥀 GOODBYE PROTOCOL ---
        if (action === 'remove' && (config?.goodbye || globalSettings.goodbye)) {
            for (let num of participants) {
                let byeLog = `┌────────────────────────┈\n`;
                byeLog += `│      *ᴠ-ʜᴜʙ_ɢᴏᴏᴅʙʏᴇ* \n`;
                byeLog += `└────────────────────────┈\n\n`;
                
                byeLog += `┌─『 ᴍᴇᴍʙᴇʀ_ᴇxɪᴛ_ʟᴏɢ 』\n`;
                byeLog += `│ 🥀 ғᴀʀᴇᴡᴇʟʟ: @${num.split('@')[0]}\n`;
                byeLog += `│ ⚙ ʟᴏɢ: ᴜsᴇʀ_ʟᴇғᴛ_ᴛʜᴇ_ɢʀɪᴅ\n`;
                byeLog += `└────────────────────────┈\n\n`;
                
                byeLog += `_“ᴡᴇ_ʜᴏᴘᴇ_ᴛᴏ_sᴇᴇ_ʏᴏᴜ_ᴀɢᴀɪɴ”_`;

                await sock.sendMessage(id, { 
                    text: byeLog, 
                    mentions: [num] 
                });
            }
        }

    } catch (e) {
        console.error("Group Participant Update Error:", e.message);
    }
};

export default groupUpdateHandler;
