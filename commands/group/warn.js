import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const warnCommand = {
    name: "warn",
    category: "group",
    desc: "Give a warning strike to a user",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!from.endsWith('@g.us')) return;

        // --- 📊 PERMISSION CHECKS ---
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const admins = participants.filter(p => p.admin).map(p => p.id);
        
        const sender = msg.key.participant || from;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴅᴍɪɴ ᴘʀɪᴠɪʟᴇɢᴇ ʀᴇǫᴜɪʀᴇᴅ.\n└────────────────────────┈` 
            });
        }

        // --- 🎯 TARGET DETECTION ---
        let user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                   msg.message?.extendedTextMessage?.contextInfo?.participant;

        if (!user || user === botId) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴡᴀʀɴ [ʀᴇᴘʟʏ/ᴛᴀɢ]\n│ ⚙ *ᴀɪᴍ:* ɪssᴜᴇ ᴀ ᴍᴏᴅ sᴛʀɪᴋᴇ\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "⚠️", key: msg.key } });

        try {
            await client.connect();
            const db = client.db("vinnieBot");
            const collection = db.collection("warnings");

            // Increment warning count in DB
            const warnDoc = await collection.findOneAndUpdate(
                { groupId: from, userId: user },
                { $inc: { count: 1 } },
                { upsert: true, returnDocument: 'after' }
            );

            const strikeCount = warnDoc.count;
            const reason = args.join(" ") || "ɴᴏ_ʀᴇᴀsᴏɴ_ᴘʀᴏᴠɪᴅᴇᴅ";

            // --- 📑 PUNISHMENT UI ---
            let warnMsg = `┌────────────────────────┈\n`;
            warnMsg += `│      *ᴠ-ʜᴜʙ_ᴍᴏᴅ_sʏsᴛᴇᴍ* \n`;
            warnMsg += `└────────────────────────┈\n\n`;
            
            warnMsg += `┌─『 ᴡᴀʀɴɪɴɢ_ɪssᴜᴇᴅ 』\n`;
            warnMsg += `│ 👤 *ᴜsᴇʀ:* @${user.split('@')[0]}\n`;
            warnMsg += `│ ⚠️ *sᴛʀɪᴋᴇ:* ${strikeCount} / 𝟹\n`;
            warnMsg += `│ 📝 *ʀᴇᴀsᴏɴ:* ${reason}\n`;
            warnMsg += `└────────────────────────┈\n\n`;
            
            if (strikeCount >= 3) {
                warnMsg += `⚠️ *ᴛʜʀᴇsʜᴏʟᴅ ʀᴇᴀᴄʜᴇᴅ:* ᴇxᴇᴄᴜᴛɪɴɢ ᴋɪᴄᴋ...`;
                // Optional: Trigger kick logic here
                // await sock.groupParticipantsUpdate(from, [user], "remove");
                // await collection.deleteOne({ groupId: from, userId: user });
            } else {
                warnMsg += `_🛡️ 𝟹 sᴛʀɪᴋᴇs ᴡɪʟʟ ʀᴇsᴜʟᴛ ɪɴ ᴀ ᴋɪᴄᴋ._`;
            }

            await sock.sendMessage(from, { 
                text: warnMsg, 
                mentions: [user] 
            }, { quoted: msg });

        } catch (err) {
            console.error("Warning System Error:", err);
            await sock.sendMessage(from, { text: "❌ ᴅᴀᴛᴀʙᴀsᴇ_ᴇʀʀᴏʀ: ᴜɴᴀʙʟᴇ ᴛᴏ ʟᴏɢ sᴛʀɪᴋᴇ." });
        } finally {
            await client.close();
        }
    }
};

export default warnCommand;
