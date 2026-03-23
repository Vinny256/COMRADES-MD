import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const goodbyeCommand = {
    name: "goodbye",
    category: "owner",
    desc: "Toggle goodbye messages (Global or Specific)",
    async execute(sock, msg, args, { from, isMe, settings, prefix }) {
        // --- 🛡️ FOUNDER-ONLY SHIELD ---
        if (!isMe) return;

        const action = args[0]?.toLowerCase(); // 'on' or 'off'
        const target = args[1]; // 'all' or JID

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "✨", key: msg.key } });

        // --- 1. GLOBAL TOGGLE (settings.json) ---
        if (target === "all") {
            settings.goodbye = (action === "on");
            
            if (global.saveSettings) await global.saveSettings();
            
            let globalMsg = `┌────────────────────────┈\n`;
            globalMsg += `│      *ɢʟᴏʙᴀʟ_ɢᴏᴏᴅʙʏᴇ* \n`;
            globalMsg += `└────────────────────────┈\n\n`;
            globalMsg += `┌─『 sʏsᴛᴇᴍ_ᴜᴘᴅᴀᴛᴇ 』\n`;
            globalMsg += `│ 🛡️ *sᴛᴀᴛᴜs:* ${action.toUpperCase()}\n`;
            globalMsg += `│ ⚙ *sᴄᴏᴘᴇ:* ᴀʟʟ_ɢʀᴏᴜᴘs\n`;
            globalMsg += `└────────────────────────┈\n\n`;
            globalMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            return sock.sendMessage(from, { text: globalMsg });
        }

        // --- 2. SPECIFIC GROUP TOGGLE (MongoDB) ---
        const groupJid = (target && target.endsWith('@g.us')) ? target : (from.endsWith('@g.us') ? from : null);

        if (!groupJid) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ɢᴏᴏᴅʙʏᴇ [ᴏɴ/ᴏғғ]\n│ ⚙ *ɢʟᴏʙᴀʟ:* ${prefix}ɢᴏᴏᴅʙʏᴇ [ᴏɴ/ᴏғғ] ᴀʟʟ\n└────────────────────────┈` 
            });
        }

        try {
            await client.connect();
            await client.db("vinnieBot").collection("group_configs").updateOne(
                { groupId: groupJid },
                { $set: { goodbye: (action === "on") } },
                { upsert: true }
            );

            let localMsg = `┌────────────────────────┈\n`;
            localMsg += `│      *ɢᴏᴏᴅʙʏᴇ_ᴄᴏɴғɪɢ* \n`;
            localMsg += `└────────────────────────┈\n\n`;
            localMsg += `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n`;
            localMsg += `│ 🛡️ *sᴛᴀᴛᴜs:* ${action.toUpperCase()}\n`;
            localMsg += `│ ⚙ *ʟᴏɢ:* ᴜᴘᴅᴀᴛᴇ_sᴜᴄᴄᴇss ✦\n`;
            localMsg += `└────────────────────────┈\n\n`;
            localMsg += `_ɢʀᴏᴜᴘ_ɪᴅ: ${groupJid.split('@')[0]}_`;

            await sock.sendMessage(from, { text: localMsg });

        } catch (err) {
            console.error("DB Error:", err);
            await sock.sendMessage(from, { text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʟᴏɢ:* ᴅᴀᴛᴀʙᴀsᴇ_ᴄᴏɴɴ_ғᴀɪʟᴇᴅ\n└────────────────────────┈` });
        } finally {
            await client.close();
        }
    }
};

export default goodbyeCommand;
