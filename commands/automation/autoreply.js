import { MongoClient } from "mongodb";

// Initialize MongoDB Client (ESM Style)
const client = new MongoClient(process.env.MONGO_URI || "");

const autoreplyCommand = {
    name: ['autoreply', 'ai'],
    category: 'automation',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const senderJid = m.key.participant || from;
        const senderNumber = senderJid.split('@')[0];
        const pushName = m.pushName || "ᴄᴏᴍʀᴀᴅᴇ";
        const prefix = "."; // Adjust based on your global prefix
        
        const db = client.db("vinnieBot");
        const configColl = db.collection("ai_config");

        // --- ⚡ UNICODE SLEEK STYLING ---
        if (args.length === 0) {
            let usage = `┌────────────────────────┈\n`;
            usage += `│      *ᴀɪ_ᴀᴜᴛᴏʀᴇᴘʟʏ* \n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `┌─『 ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ 』\n`;
            usage += `│ ├─◈ ${prefix}ᴀᴜᴛᴏʀᴇᴘʟʏ ᴏɴ / ᴏғғ\n`;
            usage += `│ ├─◈ ${prefix}ᴀᴜᴛᴏʀᴇᴘʟʏ ɪɴʙᴏx\n`;
            usage += `│ ╰─◈ ${prefix}ᴀᴜᴛᴏʀᴇᴘʟʏ ᴀʟʟ\n`;
            usage += `└────────────────────────┈\n\n`;
            
            usage += `◈ *ᴜsᴀɢᴇ:* ᴛᴏɢɢʟᴇ ᴀɪ ʀᴇsᴘᴏɴsᴇs`;
            
            return sock.sendMessage(from, { text: usage });
        }

        const input = args[0].toLowerCase();
        let updateData = { updatedAt: new Date() };

        if (input === 'on') {
            updateData.status = 'on';
            updateData.scope = 'all';
        } else if (input === 'off') {
            updateData.status = 'off';
        } else if (input === 'inbox') {
            updateData.status = 'on';
            updateData.scope = 'inbox';
        } else if (input === 'all') {
            updateData.status = 'on';
            updateData.scope = 'all';
        } else {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ɪɴᴠᴀʟɪᴅ ᴏᴘᴛɪᴏɴ.\n└────────────────────────┈` 
            });
        }

        try {
            // --- DATABASE SYNC ---
            await configColl.updateOne({ id: senderNumber }, { $set: updateData }, { upsert: true });
            await configColl.updateOne({ id: pushName }, { $set: updateData }, { upsert: true });

            console.log(`✅ AI_CONFIG Saved for ${senderNumber} (${pushName}): ${input}`);
            
            let confirmation = `┌────────────────────────┈\n`;
            confirmation += `│      *ᴀɪ_ᴄᴏɴғɪɢ_ᴜᴘᴅᴀᴛᴇᴅ* \n`;
            confirmation += `└────────────────────────┈\n\n`;
            
            confirmation += `┌─『 sᴛᴀᴛᴜs ᴜᴘᴅᴀᴛᴇ 』\n`;
            confirmation += `│ ⚙ *sᴛᴀᴛᴜs:* ${updateData.status?.toUpperCase()} ✦\n`;
            confirmation += `│ ⚙ *sᴄᴏᴘᴇ:* ${updateData.scope?.toUpperCase() || 'ᴀʟʟ'}\n`;
            confirmation += `│ ⚙ *sʏsᴛᴇᴍ:* sʏɴᴄᴇᴅ_ᴛᴏ_ᴄʟᴏᴜᴅ\n`;
            confirmation += `└────────────────────────┈\n\n`;
            
            confirmation += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: confirmation }, { quoted: m });
            
        } catch (e) {
            console.error("Database Error:", e.message);
            await sock.sendMessage(from, { text: "│ ❌ ᴅᴀᴛᴀʙᴀsᴇ sʏɴᴄ ғᴀɪʟᴇᴅ." });
        }
    }
};

export default autoreplyCommand;
