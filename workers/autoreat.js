const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg) => {
    try {
        // 1. 🛡️ GRID SYNC: Load fresh settings every time a status appears
        const settings = fs.readJsonSync(settingsFile);
        
        // Check if the overall feature is ON
        if (!settings.status || !settings.status.autoReact) return;

        const from = msg.key.remoteJid;

        // 2. 🚥 STATUS BROADCAST LOGIC
        if (from === 'status@broadcast') {
            // Priority 1: User-set emoji from .status set [emoji]
            // Priority 2: Random Hub Emojis (Backup)
            const hubEmojis = ["🚀", "⚡", "🔥", "✅", "💎", "✨", "🌸"];
            const backupEmoji = hubEmojis[Math.floor(Math.random() * hubEmojis.length)];
            
            const finalEmoji = settings.status.emoji || backupEmoji;

            // 3. SEND REACTION
            // We use statusJidList to ensure the reaction actually shows up on the recipient's phone
            await sock.sendMessage(
                from, 
                { react: { text: finalEmoji, key: msg.key } }, 
                { statusJidList: [msg.key.participant] }
            );
            
            // ✿ HUB_SYNC LOGGING ✿
            console.log(`✿ HUB_SYNC ✿ Status React: ${finalEmoji} | Target: ${msg.key.participant.split('@')[0]}`);
        }

    } catch (e) {
        // Silent catch to keep the message stream flowing without crashing on bad decryption
    }
};
