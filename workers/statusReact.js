import fs from 'fs-extra';

const settingsFile = './settings.json';

// 🛡️ THE CACHE SHIELD: This stops the notification spam!
const statusCache = new Set();

/**
 * V-HUB_WORKER: STATUS_REACTION_ENGINE
 * Filename: statusReact.js
 */
const statusReactWorker = {
    name: "status_react_worker",
    async execute(sock, msg) {
        try {
            // 1. Settings Validation
            if (!fs.existsSync(settingsFile)) return;
            const settings = fs.readJsonSync(settingsFile);
            
            if (!settings.status || !settings.status.autoReact) return;

            const from = msg.key.remoteJid;

            // 2. 📱 STATUS DETECTION
            if (from === 'status@broadcast') {
                // 🆔 UNIQUE FINGERPRINT: Message ID + Person
                const statusId = `${msg.key.id}_${msg.key.participant}`;

                // 🛑 THE SILENCER: If we already liked this, STOP.
                if (statusCache.has(statusId)) return;
                statusCache.add(statusId);

                // Keep cache lean (last 100 statuses)
                if (statusCache.size > 100) {
                    const oldest = statusCache.values().next().value;
                    statusCache.delete(oldest);
                }

                const finalEmoji = settings.status.emoji || "✨";
                const participant = msg.key.participant || "";

                // ⏱️ THE SYNC DELAY: Give the View worker time to finish
                // This stops the "Bad MAC" crash
                await new Promise(resolve => setTimeout(resolve, 3000));

                // --- 🚀 DISPATCH REACTION ---
                await sock.sendMessage(
                    from, 
                    { react: { text: finalEmoji, key: msg.key } }, 
                    { statusJidList: [participant] }
                );
                
                console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sᴛᴀᴛᴜs_ʀᴇᴀᴄᴛ* \n└────────────────────────┈\n\n│ ✨ ᴇᴍᴏᴊɪ: ${finalEmoji}\n│ 👤 ᴜsᴇʀ: ${participant.split('@')[0]}\n│ ✅ sᴛᴀᴛ: ᴅᴇʟɪᴠᴇʀᴇᴅ\n└────────────────────────┈`);
            }
        } catch (e) {
            // Silent catch
        }
    }
};

export default statusReactWorker;
