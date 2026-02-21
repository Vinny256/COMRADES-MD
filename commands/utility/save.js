const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

/**
 * COMRADES-MD | UTILITY: STATUS_SAVER
 * Description: Captures status/media to RAM and reflects back to user.
 * Structure: Automated Category Loader Compatible.
 */

const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = {
    name: 'save',
    alias: ['send', 's'],
    category: 'utility',
    async execute(sock, m, args) {
        const remoteJid = m.key.remoteJid;

        // 1. Get the Quoted Message (The Status)
        const quotedInfo = m.message.extendedTextMessage?.contextInfo;
        const quotedMsg = quotedInfo?.quotedMessage;

        // Validation: Is the user replying to a status?
        if (!quotedMsg || quotedInfo.remoteJid !== 'status@broadcast') {
            return await sock.sendMessage(remoteJid, { 
                text: vStyle("INVALID_TARGET: Reply to a Status.") 
            });
        }

        try {
            // 2. Identify Media Type from the Status
            const type = Object.keys(quotedMsg)[0];
            const media = quotedMsg[type];

            // 3. Download to RAM (Buffer) - NO DISK STORAGE
            const stream = await downloadContentFromMessage(media, type.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. Send back to User
            const caption = vStyle(`STATUS_CAPTURED\n┃  Type: ${type.replace('Message', '')}`);
            
            if (type === 'imageMessage') {
                await sock.sendMessage(remoteJid, { image: buffer, caption }, { quoted: m });
            } else if (type === 'videoMessage') {
                await sock.sendMessage(remoteJid, { video: buffer, caption }, { quoted: m });
            } else if (type === 'audioMessage') {
                await sock.sendMessage(remoteJid, { audio: buffer, mimetype: 'audio/ogg' }, { quoted: m });
            } else {
                // Handle cases like status text or unsupported media
                await sock.sendMessage(remoteJid, { text: vStyle("UNSUPPORTED_STATUS_TYPE") });
            }

            // 5. Manual Garbage Collection
            buffer = null;

        } catch (e) {
            console.error(e);
            await sock.sendMessage(remoteJid, { 
                text: vStyle("ERROR: STATUS_EXPIRED_OR_FAILED") 
            });
        }
    }
};