const { generateForwardMessageContent, generateWAMessageFromContent } = require("@whiskeysockets/baileys");

module.exports = async (sock, msg, settings) => {
    const from = msg.key.remoteJid;
    
    if (from !== 'status@broadcast') return;
    if (msg.key.fromMe) return;

    const senderNumber = msg.key.participant.split('@')[0];
    const ownerNumber = process.env.OWNER_NUMBER || "254768666068";
    const jid = `${ownerNumber}@s.whatsapp.net`;

    global.optOutStatus = global.optOutStatus || new Set();
    if (global.optOutStatus.has(senderNumber)) return;

    try {
        const pushName = msg.pushName || "User";
        const caption = `📥 *sᴛᴀᴛᴜs ᴀᴜᴛᴏsᴀᴠᴇᴅ*\n👤 *From:* ${pushName} (@${senderNumber})`;

        // Native method to "Copy and Forward"
        let staging = await generateForwardMessageContent(msg, true);
        let contentType = Object.keys(staging)[0];
        
        // Ensure the caption is added to the forwarded media
        if (staging[contentType] && staging[contentType].caption !== undefined) {
            staging[contentType].caption = caption;
        } else if (contentType === 'conversation') {
            staging[contentType] = staging[contentType] + '\n\n' + caption;
        } else if (staging[contentType]) {
            staging[contentType].caption = caption;
        }

        const finalMsg = await generateWAMessageFromContent(jid, staging, {});
        await sock.relayMessage(jid, finalMsg.message, { messageId: finalMsg.key.id });

    } catch (e) {
        if (!e.message.includes('rate-overlimit')) {
            console.error("Autosave Error:", e.message);
        }
    }
};
