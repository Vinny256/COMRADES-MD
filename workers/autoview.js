import fs from 'fs-extra';
import { delay } from "@whiskeysockets/baileys";

const settingsFile = './settings.json';

const autoReadWorker = {
    name: "autoview_worker",
    async execute(sock, msg, settings) {
        try {
            if (!settings.autoview) return;

            const from = msg.key.remoteJid;
            if (!from || from.endsWith('@newsletter')) return;

            // ⏳ STARTUP GRACE (Prevents crashing on old messages)
            const messageTimestamp = (msg.messageTimestamp * 1000) || Date.now();
            const botStartTime = global.connectionOpenTime || Date.now();
            if (messageTimestamp < botStartTime) return;

            // 🛡️ LOCK CHECK
            if (global.lockedContacts && global.lockedContacts.has(from)) return;

            // 🛑 THE STATUS SYNC: 
            // If it's a status, we wait 1 second to let the REACT worker finish its check
            // This prevents "Double-Processing" the same packet
            if (from === 'status@broadcast') {
                await delay(1000); 
            }

            // 🚥 MARK AS READ
            await sock.readMessages([msg.key]);

            const participant = msg.key.participant || from;
            const name = msg.pushName || participant.split('@')[0];

            if (from === 'status@broadcast') {
                console.log(`[V-HUB] Status Viewed: ${name}`);
            } else if (settings.bluetick) {
                console.log(`[V-HUB] Message Read: ${name}`);
            }

        } catch (e) { }
    }
};

export default autoReadWorker;
