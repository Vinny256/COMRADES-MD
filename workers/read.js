import fs from 'fs-extra';

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: BLUE_TICK_ENGINE
 * Filename: read.js
 * Logic: Marks regular messages as read (Blue Ticks).
 */
const readWorker = {
    name: "read_worker",
    async execute(sock, msg, settings) {
        try {
            // 1. Only run if Blue Tick is enabled
            if (!settings.bluetick) return;

            const from = msg.key.remoteJid;
            
            // 🛑 FILTER: Skip statuses and newsletters
            // This ensures this worker stays out of the way of 'autoveiw.js'
            if (!from || from === 'status@broadcast' || from.endsWith('@newsletter')) return;

            // 2. ⏳ STARTUP GRACE (Bad MAC Shield)
            const messageTimestamp = (msg.messageTimestamp * 1000) || Date.now();
            const botStartTime = global.connectionOpenTime || Date.now();
            if (messageTimestamp < botStartTime) return;

            // 3. 🛡️ LOCK CHECK
            if (global.lockedContacts && global.lockedContacts.has(from)) return;

            // 4. 🔵 THE ACTION
            await sock.readMessages([msg.key]);

            // 5. 📱 LOGGING
            const participant = msg.key.participant || from;
            const name = msg.pushName || participant.split('@')[0];
            
            console.log(`[V-HUB] Blue Tick Sent: ${name} 🔵`);

        } catch (e) {
            // Silent catch to keep the engine stable
        }
    }
};

export default readWorker;
