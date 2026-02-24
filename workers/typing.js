const fs = require('fs-extra');

module.exports = async (sock, msg, settings) => {
    try {
        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe;

        // 1. Basic Filters: Skip self, status updates, and newsletters
        if (!from || isMe || from === 'status@broadcast' || from.endsWith('@newsletter')) return;

        // 2. Determine Message Source
        const isGroup = from.endsWith('@g.us');
        const isInbox = from.endsWith('@s.whatsapp.net');

        // 3. Check Custom Scope (all, groups, inbox, or off)
        // This ensures it works for ALL messages, not just commands.
        const mode = settings.typingMode || 'off'; 
        let shouldType = false;

        if (mode === 'all') shouldType = true;
        else if (mode === 'groups' && isGroup) shouldType = true;
        else if (mode === 'inbox' && isInbox) shouldType = true;

        if (!shouldType) return;

        // --- 🚥 10-SECOND TYPING ENGINE ---
        
        // A. Start the "composing" status
        await sock.sendPresenceUpdate('composing', from);
        
        // Vinnie Sync Logging
        console.log(`✿ HUB_SYNC ✿ Presence: TYPING | Scope: ${mode.toUpperCase()} | Target: ${from.split('@')[0]}`);
        
        // B. THE 10-SECOND WAIT (The "Human Effect")
        // This makes the bot wait before the next worker or command executes
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // C. Stop the typing status
        await sock.sendPresenceUpdate('paused', from);

    } catch (e) {
        // Silently catch errors to keep the message queue flowing
    }
};
