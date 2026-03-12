module.exports = async (sock, msg, settings) => {
    const from = msg.key.remoteJid;
    if (from !== 'status@broadcast') return;

    const senderNumber = msg.key.participant.split('@')[0];
    const ownerNumber = process.env.OWNER_NUMBER || "254768666068";

    // Global opt-out check (set via the command in your automation folder)
    global.optOutStatus = global.optOutStatus || new Set();
    if (global.optOutStatus.has(senderNumber)) return;

    try {
        const jid = `${ownerNumber}@s.whatsapp.net`;
        const caption = `📥 *sᴛᴀᴛᴜs ᴀᴜᴛᴏsᴀᴠᴇᴅ*\n👤 *From:* ${msg.pushName || 'User'} (@${senderNumber})`;

        // Forward the status to you
        await sock.copyNForward(jid, msg, true, { caption });
    } catch (e) {
        console.error("❌ Autosave Worker Error:", e.message);
    }
};
