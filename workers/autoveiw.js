const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg, settings) => {
    try {
        // --- 🛡️ THE SYNC CHECK ---
        if (!settings.autoview) return;

        const from = msg.key.remoteJid;

        // --- ⏳ STARTUP GRACE PROTECTION ---
        // If the message arrived more than 15 seconds before the bot started, ignore it.
        // This prevents the "Old Message Bad MAC" loop on reboot.
        const messageTimestamp = msg.messageTimestamp * 1000; // Convert to ms
        const botStartTime = global.connectionOpenTime || Date.now();
        if (messageTimestamp < botStartTime) return;

        // --- 🛡️ LOCK CHECK ---
        // Don't try to read if the contact is currently in the 1-hour "Bad MAC Lock"
        if (global.lockedContacts && global.lockedContacts.has(from)) return;

        // --- 🚥 GLOBAL VIEW ENGINE ---
        await sock.readMessages([msg.key]);

        // --- 📱 STATUS AUTO-VIEW ---
        if (from === 'status@broadcast') {
            const participant = msg.key.participant || "";
            const name = msg.pushName || participant.split('@')[0];
            
            console.log(`✿ HUB_SYNC ✿ Status Viewed | From: ${name}`);
        } else {
            // This handles normal chats and group messages
            const name = msg.pushName || from.split('@')[0];
            console.log(`✿ HUB_SYNC ✿ Message Read | From: ${name}`);
        }

    } catch (e) {
        // Errors here are caught silently. 
        // If it's a Bad MAC, the Supervisor in index.js will handle the Healing/Locking.
    }
};