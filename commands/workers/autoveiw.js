const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg, settings) => {
    try {
        // --- 🛡️ THE SYNC CHECK ---
        // Ensuring the feature is toggled ON via your command
        if (!settings.autoview) return;

        const from = msg.key.remoteJid;

        // --- 🚥 GLOBAL VIEW ENGINE (STOPS BAD MAC) ---
        // This marks the message as 'read' on the server and your phone
        await sock.readMessages([msg.key]);

        // --- 📱 STATUS AUTO-VIEW ---
        if (from === 'status@broadcast') {
            // This specific call tells the server you viewed the status
            await sock.readMessages([msg.key]);
            
            console.log(`✿ HUB_SYNC ✿ Status Viewed | From: ${msg.key.participant.split('@')[0]}`);
        } else {
            // This handles normal chats and group messages
            console.log(`✿ HUB_SYNC ✿ Message Read | From: ${from.split('@')[0]}`);
        }

    } catch (e) {
        // Catching errors to ensure the queue never stalls
    }
};