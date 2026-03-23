import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const totalMsgCommand = {
    name: "totalmsg",
    category: "group",
    desc: "Show the most active members in the group",
    async execute(sock, msg, args, { from, prefix }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!from.endsWith('@g.us')) return;

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "📈", key: msg.key } });

        try {
            await client.connect();
            const db = client.db("vinnieBot");
            const collection = db.collection("message_counts");

            // Fetch top 10 most active members for this specific group
            const topMembers = await collection.find({ groupId: from })
                .sort({ count: -1 })
                .limit(10)
                .toArray();

            if (topMembers.length === 0) {
                return sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ɴᴏᴛɪᴄᴇ 』\n│ ⚠️ ɴᴏ ᴀᴄᴛɪᴠɪᴛʏ ᴅᴀᴛᴀ ʀᴇᴄᴏʀᴅᴇᴅ.\n│ ⚙ sᴛᴀᴛᴜs: ᴡᴀɪᴛɪɴɢ_ғᴏʀ_ɪɴᴘᴜᴛ\n└────────────────────────┈` 
                });
            }

            // --- 📑 ANALYTICS UI CONSTRUCTION ---
            let leaderboard = `┌────────────────────────┈\n`;
            leaderboard += `│      *ᴠ-ʜᴜʙ_ᴀᴄᴛɪᴠɪᴛʏ_ʙᴏᴀʀᴅ* \n`;
            leaderboard += `└────────────────────────┈\n\n`;
            
            leaderboard += `┌─『 ᴛᴏᴘ_ᴄᴏɴᴛʀɪʙᴜᴛᴏʀs 』\n`;
            
            topMembers.forEach((user, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🔹";
                const rank = (index + 1).toString().padStart(2, '0');
                leaderboard += `│ ${medal} *${rank}.* @${user.userId.split('@')[0]}\n`;
                leaderboard += `│ 📊 *ᴍsɢs:* ${user.count.toLocaleString()}\n`;
                if (index < topMembers.length - 1) leaderboard += `│  ┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
            });

            leaderboard += `└────────────────────────┈\n\n`;
            leaderboard += `_✨ ᴋᴇᴇᴘ ᴄʜᴀᴛᴛɪɴɢ ᴛᴏ ᴄʟɪᴍʙ!_`;

            // --- 🚀 DISPATCH WITH MENTIONS ---
            await sock.sendMessage(from, { 
                text: leaderboard, 
                mentions: topMembers.map(u => u.userId),
                contextInfo: {
                    externalAdReply: {
                        title: "ɢʀᴏᴜᴘ ᴇɴɢᴀɢᴇᴍᴇɴᴛ ʀᴇᴘᴏʀᴛ",
                        body: "Live Activity Tracking via V_HUB",
                        thumbnailUrl: await sock.profilePictureUrl(from, 'image').catch(() => null),
                        sourceUrl: "https://github.com/vinnie-hub",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: msg });

        } catch (err) {
            console.error("Database Error:", err);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ᴅᴀᴛᴀʙᴀsᴇ_ᴄᴏɴɴᴇᴄᴛɪᴏɴ_ғᴀɪʟᴇᴅ\n└────────────────────────┈` 
            });
        } finally {
            // Keep the connection pooling efficient
            await client.close();
        }
    }
};

export default totalMsgCommand;
