const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

module.exports = {
    name: 'vv',
    category: 'utility',
    async execute(sock, m, args) {
        const remoteJid = m.key.remoteJid;
        
        // 1. Get the Quoted Message
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(remoteJid, { text: "❌ *V_HUB:* Reply to a ViewOnce message." });
        }

        // 2. Deep Search for ViewOnce Content
        // WhatsApp sometimes nests this differently
        const viewOnce = quoted.viewOnceMessageV2 || quoted.viewOnceMessage || quoted.viewOnceMessageV2Extension;
        const actualMsg = viewOnce ? viewOnce.message : quoted;

        // 3. Identify Media Type
        const type = Object.keys(actualMsg)[0];
        const media = actualMsg[type];

        // Validation: Is it actually ViewOnce?
        if (!viewOnce && !media?.viewOnce) {
            return sock.sendMessage(remoteJid, { text: "⚠️ *V_HUB:* This is not a ViewOnce message." });
        }

        try {
            // 4. Download to RAM (Buffer) - NO DISK STORAGE
            const stream = await downloadContentFromMessage(media, type.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 5. Send to User
            const caption = `✅ *V_HUB ANTI-VIEWONCE*\nType: ${type}`;
            
            if (type === 'imageMessage') {
                await sock.sendMessage(remoteJid, { image: buffer, caption }, { quoted: m });
            } else if (type === 'videoMessage') {
                await sock.sendMessage(remoteJid, { video: buffer, caption }, { quoted: m });
            } else if (type === 'audioMessage') {
                await sock.sendMessage(remoteJid, { audio: buffer, mimetype: 'audio/ogg' }, { quoted: m });
            }

            // 6. Manual Garbage Collection hint
            buffer = null; 

        } catch (e) {
            console.error(e);
            await sock.sendMessage(remoteJid, { text: "❌ *V_HUB:* Media expired or could not be fetched." });
        }
    }
};