import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const meCommand = {
    name: "me",
    category: "group",
    desc: "Check your personal group stats",
    async execute(sock, msg, args, { from, prefix }) {
        const sender = msg.key.participant || from;
        const pushName = msg.pushName || "ᴜsᴇʀ";

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "👤", key: msg.key } });

        try {
            await client.connect();
            const db = client.db("vinnieBot");
            const userData = await db.collection("message_counts").findOne({ groupId: from, userId: sender });
            
            const count = userData ? userData.count : 0;
            // Simple 2026 Leveling Logic (Level = sqrt of messages / 2)
            const level = Math.floor(Math.sqrt(count) / 2) || 1;

            // --- 📑 PREMIUM STATS UI ---
            let stats = `┌────────────────────────┈\n`;
            stats += `│      *ᴠ-ʜᴜʙ_ᴜsᴇʀ_ᴘʀᴏғɪʟᴇ* \n`;
            stats += `└────────────────────────┈\n\n`;
            
            stats += `┌─『 ᴘᴇʀsᴏɴᴀʟ_ᴍᴇᴛʀɪᴄs 』\n`;
            stats += `│ 👤 *ᴜsᴇʀ:* @${sender.split('@')[0]}\n`;
            stats += `│ 🏷️ *ɴᴀᴍᴇ:* ${pushName}\n`;
            stats += `│ 📊 *ᴍᴇssᴀɢᴇs:* ${count}\n`;
            stats += `│ 🛡️ *ʟᴇᴠᴇʟ:* ${level} ✦\n`;
            stats += `│ 🏆 *ʀᴀɴᴋ:* _ᴄᴀʟᴄᴜʟᴀᴛɪɴɢ..._\n`;
            stats += `└────────────────────────┈\n\n`;
            
            stats += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: stats, 
                mentions: [sender],
                contextInfo: {
                    externalAdReply: {
                        title: `${pushName}'s Insights`,
                        body: `Level ${level} Member`,
                        thumbnailUrl: await sock.profilePictureUrl(sender, 'image').catch(() => null),
                        sourceUrl: "https://github.com/vinnie-hub",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: msg });

        } catch (err) {
            console.error("Stats Error:", err);
        } finally {
            await client.close();
        }
    }
};

export default meCommand;
