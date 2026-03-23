import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const setGoodbyeCommand = {
    name: 'setgoodbye',
    category: 'owner',
    desc: 'Set custom goodbye message for groups',
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ FOUNDER-ONLY SHIELD ---
        if (!isMe) return;

        // --- 📝 INPUT VALIDATION ---
        const text = args.join(" ");
        if (!text) {
            let usageMsg = `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n`;
            usageMsg += `│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}sᴇᴛɢᴏᴏᴅʙʏᴇ [ᴛᴇxᴛ]\n`;
            usageMsg += `│ 💡 *ᴠᴀʀɪᴀʙʟᴇs:* @ᴜsᴇʀ, @ɢʀᴏᴜᴘ, @ᴅᴇsᴄ\n`;
            usageMsg += `└────────────────────────┈`;
            return sock.sendMessage(from, { text: usageMsg });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🥀", key: msg.key } });

        // Identify if a specific group JID was provided, else use current group
        const targetJid = args.find(a => a.endsWith('@g.us')) || from;

        try {
            // --- 🚀 DATABASE UPDATE ---
            await client.connect();
            await client.db("vinnieBot").collection("group_configs").updateOne(
                { groupId: targetJid },
                { $set: { goodbyeText: text } },
                { upsert: true }
            );

            // --- 📑 CONFIGURATION LOG ---
            let configLog = `┌────────────────────────┈\n`;
            configLog += `│      *ɢᴏᴏᴅʙʏᴇ_ᴜᴘᴅᴀᴛᴇ* \n`;
            configLog += `└────────────────────────┈\n\n`;
            configLog += `┌─『 sᴛᴀᴛᴜs_ʀᴇᴘᴏʀᴛ 』\n`;
            configLog += `│ ✅ *sᴛᴀᴛᴜs:* ᴄᴏɴғɪɢ_ʟɪᴠᴇ\n`;
            configLog += `│ 📍 *ɢʀᴏᴜᴘ:* ${targetJid.split('@')[0]}\n`;
            configLog += `│ 📝 *ᴛᴇxᴛ:* ${text}\n`;
            configLog += `└────────────────────────┈\n\n`;
            configLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: configLog });

        } catch (err) {
            console.error("DB Error:", err);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ᴅᴀᴛᴀʙᴀsᴇ_ᴜᴘᴅᴀᴛᴇ_ғᴀɪʟᴇᴅ\n└────────────────────────┈` 
            });
        } finally {
            await client.close();
        }
    }
};

export default setGoodbyeCommand;
