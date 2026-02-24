const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg) => {
    try {
        const settings = fs.readJsonSync(settingsFile);
        if (!settings.status || !settings.status.autoReact) return;

        const from = msg.key.remoteJid;

        if (from === 'status@broadcast') {
            const finalEmoji = settings.status.emoji || "✨";

            await sock.sendMessage(
                from, 
                { react: { text: finalEmoji, key: msg.key } }, 
                { statusJidList: [msg.key.participant] }
            );
            
            console.log(`✿ HUB_SYNC ✿ Status React: ${finalEmoji} | User: ${msg.key.participant.split('@')[0]}`);
        }
    } catch (e) {
        // Keeps the loop running even if status data is corrupted
    }
};
