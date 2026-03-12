const fs = require('fs-extra');

module.exports = async (sock, msg, settings) => {
    const from = msg.key.remoteJid;
    
    // Only process status updates
    if (from !== 'status@broadcast') return;

    const senderNumber = msg.key.participant.split('@')[0];
    const ownerNumber = process.env.OWNER_NUMBER || "254768666068";

    // 1. Check if user opted out of autosave
    global.optOutStatus = global.optOutStatus || new Set();
    if (global.optOutStatus.has(senderNumber)) {
        await sock.readMessages([msg.key]); // Just mark as read
        return;
    }

    try {
        // 2. Mark as read and Send Reaction
        await sock.readMessages([msg.key]);
        await sock.sendMessage(from, { 
            react: { text: '✨', key: msg.key } 
        }, { statusJidList: [msg.key.participant] });

        // 3. Forward the status to your Private Chat (Autosave)
        // We use the 'copyNForward' behavior or just re-send the message content
        const jid = `${ownerNumber}@s.whatsapp.net`;
        const caption = `📥 *sᴛᴀᴛᴜs ᴀᴜᴛᴏsᴀᴠᴇᴅ*\n👤 *From:* ${msg.pushName || 'User'} (@${senderNumber})`;

        await sock.copyNForward(jid, msg, true, { caption });

        console.log(`✅ [ᴀᴜᴛᴏsᴀᴠᴇ]: ${msg.pushName} status saved to private chat.`);
    } catch (e) {
        console.error("❌ Status Autosave Error:", e.message);
    }
};
