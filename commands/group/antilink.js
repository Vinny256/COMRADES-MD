import fs from 'fs-extra';
import { MongoClient } from 'mongodb';

const settingsFile = './settings.json';
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

const antilinkCommand = {
    name: 'antilink',
    category: 'group',
    desc: 'Toggle link protection (Local, Specific, or Global)',
    async execute(sock, msg, args, { from, isMe, settings, prefix }) {
        const action = args[0]?.toLowerCase(); // 'on' or 'off'
        const target = args[1]; // JID or 'all'
        
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });

        // --- 1. GLOBAL TOGGLE (Master Control) ---
        if (target === "all") {
            if (!isMe) {
                return sock.sendMessage(from, { 
                    text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ғᴏᴜɴᴅᴇʀ ᴘʀɪᴠɪʟᴇɢᴇ ʀᴇǫᴜɪʀᴇᴅ.\n└────────────────────────┈` 
                });
            }
            
            settings.antilink = (action === 'on');
            fs.writeJsonSync(settingsFile, settings); 
            
            let globalMsg = `┌────────────────────────┈\n`;
            globalMsg += `│      *ɢʟᴏʙᴀʟ_ᴀɴᴛɪ_ʟɪɴᴋ* \n`;
            globalMsg += `└────────────────────────┈\n\n`;
            globalMsg += `┌─『 sʏsᴛᴇᴍ_ᴜᴘᴅᴀᴛᴇ 』\n`;
            globalMsg += `│ 🛡️ *sᴛᴀᴛᴜs:* ${action.toUpperCase()}\n`;
            globalMsg += `│ ⚙ *sᴄᴏᴘᴇ:* ᴀʟʟ_ɢʀᴏᴜᴘs\n`;
            globalMsg += `└────────────────────────┈\n\n`;
            globalMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            return sock.sendMessage(from, { text: globalMsg });
        }

        // --- 2. SPECIFIC/LOCAL GROUP TOGGLE ---
        const groupId = (target && target.endsWith('@g.us')) ? target : (from.endsWith('@g.us') ? from : null);

        if (groupId) {
            const metadata = await sock.groupMetadata(groupId);
            const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            const isAdmin = admins.includes(msg.key.participant || from) || isMe;
            const isBotAdmin = admins.includes(botId);

            if (!isAdmin) {
                return sock.sendMessage(from, { 
                    text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴅᴍɪɴ ᴘʀɪᴠɪʟᴇɢᴇ ʀᴇǫᴜɪʀᴇᴅ.\n└────────────────────────┈` 
                });
            }

            if (!isBotAdmin && action === 'on') {
                return sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴇʀʀᴏʀ:* ʙᴏᴛ ɴᴇᴇᴅs ᴀᴅᴍɪɴ sᴛᴀᴛᴜs.\n└────────────────────────┈` 
                });
            }

            if (action === 'on' || action === 'off') {
                try {
                    await client.connect();
                    await client.db("vinnieBot").collection("group_configs").updateOne(
                        { groupId: groupId },
                        { $set: { antilink: (action === 'on') } },
                        { upsert: true }
                    );
                    
                    let localMsg = `┌────────────────────────┈\n`;
                    localMsg += `│      *ᴀɴᴛɪ_ʟɪɴᴋ_ᴄᴏɴғɪɢ* \n`;
                    localMsg += `└────────────────────────┈\n\n`;
                    localMsg += `┌─『 ᴍᴏᴅᴇʀᴀᴛɪᴏɴ 』\n`;
                    localMsg += `│ 🛡️ *sᴛᴀᴛᴜs:* ${action.toUpperCase()}\n`;
                    localMsg += `│ ⚙ *ʟɪɴᴋs:* ${action === 'on' ? 'ʀᴇsᴛʀɪᴄᴛᴇᴅ 🚫' : 'ᴀʟʟᴏᴡᴇᴅ ✅'}\n`;
                    localMsg += `└────────────────────────┈\n\n`;
                    localMsg += `_ɢʀᴏᴜᴘ_ɪᴅ: ${groupId.split('@')[0]}_`;

                    return sock.sendMessage(from, { text: localMsg });
                } catch (err) {
                    console.error("DB Error:", err);
                } finally {
                    await client.close();
                }
            }
        }

        // --- 3. HELP UI ---
        let helpMsg = `┌────────────────────────┈\n`;
        helpMsg += `│      *ᴀɴᴛɪ_ʟɪɴᴋ_ɢᴜɪᴅᴇ* \n`;
        helpMsg += `└────────────────────────┈\n\n`;
        helpMsg += `┌─『 ᴄᴏᴍᴍᴀɴᴅs 』\n`;
        helpMsg += `│ ⚙ ${prefix}ᴀɴᴛɪʟɪɴᴋ ᴏɴ\n`;
        helpMsg += `│ ⚙ ${prefix}ᴀɴᴛɪʟɪɴᴋ ᴏɴ ᴀʟʟ\n`;
        helpMsg += `│ ⚙ ${prefix}ᴀɴᴛɪʟɪɴᴋ ᴏɴ [ᴊɪᴅ]\n`;
        helpMsg += `└────────────────────────┈\n\n`;
        helpMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        await sock.sendMessage(from, { text: helpMsg });
    }
};

export default antilinkCommand;
