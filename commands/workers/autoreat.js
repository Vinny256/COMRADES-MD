const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg, settings) => {
    try {
        // --- 🛡️ THE SYNC CHECK ---
        // We use your 'autoreact' setting from the command above
        if (!settings.autoreact) return;

        const from = msg.key.remoteJid;

        // --- 🚥 STATUS BROADCAST LOGIC ---
        // React to statuses while keeping the encryption keys safe
        if (from === 'status@broadcast') {
            const statusEmojis = ["🚀", "⚡", "🔥", "✅", "💎", "✨"];
            const selectedEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];

            await sock.sendMessage(
                from, 
                { react: { text: selectedEmoji, key: msg.key } }, 
                { statusJidList: [msg.key.participant] }
            );
            
            // Your custom logging style preserved in console
            console.log(`✿ HUB_SYNC ✿ Status React: ${selectedEmoji} | User: ${msg.key.participant.split('@')[0]}`);
        }

    } catch (e) {
        // Keeps the queue moving if a session error occurs
    }
};