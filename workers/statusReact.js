import fs from 'fs-extra';

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: STATUS_REACTION_ENGINE
 * Filename: statusReact.js
 * Logic: Auto-React to Status/Broadcast with customizable emoji.
 */
const statusReactWorker = {
    name: "status_react_worker",
    async execute(sock, msg) {
        try {
            // 1. Settings Validation
            if (!fs.existsSync(settingsFile)) return;
            const settings = fs.readJsonSync(settingsFile);
            
            // Logic: Only run if status autoReact is ENABLED
            if (!settings.status || !settings.status.autoReact) return;

            const from = msg.key.remoteJid;

            // 2. 📱 STATUS DETECTION
            if (from === 'status@broadcast') {
                const finalEmoji = settings.status.emoji || "✨";
                const participant = msg.key.participant || "";

                // --- 🚀 DISPATCH REACTION ---
                await sock.sendMessage(
                    from, 
                    { react: { text: finalEmoji, key: msg.key } }, 
                    { statusJidList: [participant] }
                );
                
                // Custom Vinnie Hub Logging Style
                console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_sᴛᴀᴛᴜs_ʀᴇᴀᴄᴛ* \n└────────────────────────┈\n\n│ ✨ ᴇᴍᴏᴊɪ: ${finalEmoji}\n│ 👤 ᴜsᴇʀ: ${participant.split('@')[0]}\n│ ✅ sᴛᴀᴛ: ᴅᴇʟɪᴠᴇʀᴇᴅ\n└────────────────────────┈`);
            }
        } catch (e) {
            // Silent catch to keep the message processing loop alive
        }
    }
};

export default statusReactWorker;
