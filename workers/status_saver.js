const fs = require('fs-extra');

module.exports = async (sock, msg, settings) => {
    const from = msg.key.remoteJid;
    
    // Only process status updates
    if (from !== 'status@broadcast') return;

    // Don't save your own status updates
    if (msg.key.fromMe) return;

    const senderNumber = msg.key.participant.split('@')[0];
    const ownerNumber = process.env.OWNER_NUMBER || "254768666068";

    // Initialize global opt-out list if it doesn't exist
    global.optOutStatus = global.optOutStatus || new Set();

    // Check if the user has opted out via the .autosave off command
    if (global.optOutStatus.has(senderNumber)) return;

    try {
        const jid = `${ownerNumber}@s.whatsapp.net`;
        const pushName = msg.pushName || "User";
        
        // Define the caption for the forwarded status
        const caption = `📥 *sᴛᴀᴛᴜs ᴀᴜᴛᴏsᴀᴠᴇᴅ*\n👤 *From:* ${pushName} (@${senderNumber})`;

        // Forward the message content to your private chat
        // 'copyNForward' handles images, videos, and text perfectly
        await sock.copyNForward(jid, msg, true, { 
            caption: caption,
            contextInfo: { forwardingScore: 0, isForwarded: false } 
        });

    } catch (e) {
        // Only log serious errors to avoid cluttering Heroku logs
        if (!e.message.includes('rate-overlimit')) {
            console.error("Autosave Error:", e.message);
        }
    }
};
