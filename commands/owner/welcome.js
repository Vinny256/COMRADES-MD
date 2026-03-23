import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const welcomeToggleCommand = {
    name: "welcome",
    category: "owner",
    desc: "Toggle welcome messages (Global or Specific)",
    async execute(sock, msg, args, { from, isMe, settings, prefix }) {
        // --- 🛡️ FOUNDER-ONLY SHIELD ---
        if (!isMe) return;

        const action = args[0]?.toLowerCase(); // 'on' or 'off'
        const target = args[1]; // 'all' or JID

        if (!action || !['on', 'off'].includes(action)) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴡᴇʟᴄᴏᴍᴇ [ᴏɴ/ᴏғғ]\n│ ⚙ *ɢʟᴏʙᴀʟ:* ${prefix}ᴡᴇʟᴄᴏᴍᴇ [ᴏɴ/ᴏғғ] ᴀʟʟ\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "👋", key: msg.key } });

        // --- 1. GLOBAL TOGGLE (settings.json) ---
        if (target === "all") {
            settings.welcome = (action === "on");
            
            if (global.saveSettings) await global.saveSettings();
            
            let globalMsg = `┌────────────────────────┈\n`;
            globalMsg += `│      *ɢʟᴏʙᴀʟ_ᴡᴇʟᴄᴏᴍᴇ* \n`;
            globalMsg += `└────────────────────────┈\n\n`;
            globalMsg += `┌─『 sʏsᴛᴇᴍ_ᴜᴘᴅᴀᴛᴇ 』\n`;
            globalMsg += `│ 👋 *sᴛᴀᴛᴜs:* ${action.toUpperCase()}\n`;
            globalMsg += `│ 🌍 *sᴄᴏᴘᴇ:* ᴀʟʟ_ɢʀᴏᴜᴘs\n`;
            globalMsg += `└────────────────────────┈\n\n`;
            globalMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            return sock.sendMessage(from, { text: globalMsg });
        }

        // --- 2. SPECIFIC GROUP TOGGLE (MongoDB) ---
        const groupJid = (target && target.endsWith('@g.us')) ? target : (from.endsWith('@g.us') ? from : null);

        if (!groupJid) {
            return sock.sendMessage(from, { text: "❌ ᴘʟᴇᴀsᴇ ᴜsᴇ ɪɴ ᴀ ɢʀᴏᴜᴘ ᴏʀ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ᴊɪᴅ." });
        }

        try {
            await client.connect();
            const db = client.db("vinnieBot");
            
            await db.collection("group_configs").updateOne(
                { groupId: groupJid },
                { $set: { welcome: (action === "on") } },
                { upsert: true }
            );

            const metadata = await sock.groupMetadata(groupJid);

            let localMsg = `┌────────────────────────┈\n`;
            localMsg += `│      *ᴡᴇʟᴄᴏᴍᴇ_ᴄᴏɴғɪɢ* \n`;
            localMsg += `└────────────────────────┈\n\n`;
            localMsg += `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n`;
            localMsg += `│ 👋 *sᴛᴀᴛᴜs:* ${action.toUpperCase()}\n`;
            localMsg += `│ 🏛️ *ɢʀᴏᴜᴘ:* ${metadata.subject}\n`;
            localMsg += `│ ⚙ *ʟᴏɢ:* ᴜᴘᴅᴀᴛᴇ_sᴜᴄᴄᴇss ✦\n`;
            localMsg += `└────────────────────────┈\n\n`;
            localMsg += `_ɢʀᴏᴜᴘ_ɪᴅ: ${groupJid.split('@')[0]}_`;

            await sock.sendMessage(from, { text: localMsg });

        } catch (err) {
            console.error("DB Error:", err);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ᴅᴀᴛᴀʙᴀsᴇ_ᴄᴏɴɴ_ғᴀɪʟᴇᴅ\n└────────────────────────┈` 
            });
        } finally {
            await client.close();
        }
    }
};

export default welcomeToggleCommand;
