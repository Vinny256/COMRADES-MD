import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const topActiveCommand = {
    name: 'topactive',
    category: 'group',
    desc: 'Shows the leaderboard of most active members',
    async execute(sock, msg, args, { from, prefix }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!from.endsWith('@g.us')) return;

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "👑", key: msg.key } });

        try {
            await client.connect();
            const db = client.db("vinnieBot");
            const activity = db.collection("activity_stats");

            // Fetch top 10 users for this specific group
            const topUsers = await activity.find({ groupId: from })
                .sort({ count: -1 })
                .limit(10)
                .toArray();

            if (topUsers.length === 0) {
                return sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ɴᴏᴛɪᴄᴇ 』\n│ ⚙ ɴᴏ ᴀᴄᴛɪᴠɪᴛʏ ʀᴇᴄᴏʀᴅᴇᴅ ʏᴇᴛ.\n│ 💡 sᴛᴀʀᴛ ᴄʜᴀᴛᴛɪɴɢ ᴛᴏ ʀᴀɴᴋ ᴜᴘ!\n└────────────────────────┈` 
                });
            }

            // --- 📑 LEADERBOARD UI CONSTRUCTION ---
            let leaderboard = `┌────────────────────────┈\n`;
            leaderboard += `│      *ᴠ-ʜᴜʙ_ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ* \n`;
            leaderboard += `└────────────────────────┈\n\n`;
            
            leaderboard += `┌─『 ᴛᴏᴘ_ᴀᴄᴛɪᴠᴇ_ᴍᴇᴍʙᴇʀs 』\n`;
            
            topUsers.forEach((user, index) => {
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "✨";
                const rank = (index + 1).toString().padStart(2, '0');
                const name = user.name || `ᴜsᴇʀ_${user.userId.split('@')[0].slice(-4)}`;
                
                leaderboard += `│ ${medal} *${rank}.* ${name}\n`;
                leaderboard += `│ 📊 ᴍsɢs: ${user.count.toLocaleString()}\n`;
                if (index < topUsers.length - 1) leaderboard += `│  ┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
            });

            leaderboard += `└────────────────────────┈\n\n`;
            leaderboard += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: leaderboard,
                contextInfo: {
                    externalAdReply: {
                        title: "ɢʀᴏᴜᴘ ᴀᴄᴛɪᴠɪᴛʏ ɪɴsɪɢʜᴛs",
                        body: "Who is the most active today?",
                        thumbnailUrl: await sock.profilePictureUrl(from, 'image').catch(() => null),
                        sourceUrl: "https://github.com/vinnie-hub",
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: msg });

        } catch (err) {
            console.error("Leaderboard Error:", err);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ᴇʀʀᴏʀ ғᴇᴛᴄʜɪɴɢ ᴅᴀᴛᴀ.\n└────────────────────────┈` 
            });
        } finally {
            await client.close();
        }
    }
};

export default topActiveCommand;
