import { downloadContentFromMessage } from "@whiskeysockets/baileys";

/**
 * V-HUB_WORKER: SILENT_VIEW_ONCE_ARCHIVE
 * Logic: Independent | Auto-Download | Silent Forwarding to Owner.
 */
const antiViewOnceWorker = {
    name: "independent_antiviewonce",
    async execute(sock, msg) {
        try {
            // 1. 🛡️ BASIC PROTECTION
            if (!msg.message || msg.key.fromMe) return;

            // 2. 🔍 DETECTION: Check for different WhatsApp View Once versions
            const mtype = Object.keys(msg.message)[0];
            const isViewOnce = mtype === 'viewOnceMessageV2' || mtype === 'viewOnceMessage';
            
            if (!isViewOnce) return;

            // 3. 📦 DATA EXTRACTION
            const wrapper = msg.message[mtype];
            const content = wrapper.message;
            const mediaType = Object.keys(content)[0]; // imageMessage or videoMessage
            
            // Grab the original sender's caption if it exists
            const originalCaption = content[mediaType]?.caption || "No Caption Provided";

            // 4. 📥 DOWNLOAD MEDIA
            const stream = await downloadContentFromMessage(
                content[mediaType], 
                mediaType.replace('Message', '')
            );
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { 
                buffer = Buffer.concat([buffer, chunk]); 
            }

            // 5. 📍 TRACK ORIGIN
            const from = msg.key.remoteJid;
            const sender = msg.key.participant || from;
            const isGroup = from.endsWith('@g.us');
            
            const sourceLabel = isGroup ? `👥 GROUP: ${from}` : `👤 INBOX: ${sender.split('@')[0]}`;
            
            // Construct your archive notification
            const hubCaption = `┌─『 ᴠ-ʜᴜʙ_ᴀʀᴄʜɪᴠᴇ 』\n` +
                               `│ ✅ ᴠɪᴇᴡ_ᴏɴᴄᴇ_ᴄᴀᴘᴛᴜʀᴇᴅ\n` +
                               `│ 📍 sᴏᴜʀᴄᴇ: ${sourceLabel}\n` +
                               `│ 👤 sᴇɴᴅᴇʀ: ${msg.pushName || 'Unknown'}\n` +
                               `│ 📝 ᴄᴀᴘᴛɪᴏɴ: ${originalCaption}\n` +
                               `└────────────────────────┈`;

            // 6. 🚀 SILENT DISPATCH TO OWNER
            // This number must be your private number in International format
            const myNumber = (process.env.OWNER_NUMBER || "254768666068") + "@s.whatsapp.net";

            if (mediaType === 'imageMessage') {
                await sock.sendMessage(myNumber, { image: buffer, caption: hubCaption });
            } else if (mediaType === 'videoMessage') {
                await sock.sendMessage(myNumber, { video: buffer, caption: hubCaption });
            }

            console.log(`✅ [V-HUB_ARCHIVE]: View Once saved from ${msg.pushName || sender}`);

        } catch (e) {
            // Silent catch to stay invisible
            console.log("Archive Worker Error: " + e.message);
        }
    }
};

export default antiViewOnceWorker;
