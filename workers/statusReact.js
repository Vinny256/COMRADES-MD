import fs from 'fs-extra';

const settingsFile = './settings.json';
// 🛡️ THE GLOBAL SHIELD: Prevents reacting more than once per status
const statusCache = new Set();

const statusReactWorker = {
    name: "status_react_worker",
    async execute(sock, msg) {
        try {
            const from = msg.key.remoteJid;
            if (from !== 'status@broadcast') return;

            // 🆔 UNIQUE FINGERPRINT
            const statusId = `${msg.key.id}_${msg.key.participant}`;

            // 🛑 STOP IF ALREADY REACTED
            if (statusCache.has(statusId)) return;
            statusCache.add(statusId);

            // Keep memory lean
            if (statusCache.size > 100) {
                const oldest = statusCache.values().next().value;
                statusCache.delete(oldest);
            }

            const settings = fs.readJsonSync(settingsFile);
            if (!settings.status || !settings.status.autoReact) return;

            const finalEmoji = settings.status.emoji || "✨";
            const participant = msg.key.participant || "";

            // ⏱️ THE "BAD MAC" DELAY (Crucial)
            await new Promise(r => setTimeout(r, 2000));

            await sock.sendMessage(from, 
                { react: { text: finalEmoji, key: msg.key } }, 
                { statusJidList: [participant] }
            );

            console.log(`✅ [V-HUB]: Reacted once to ${participant.split('@')[0]}`);
        } catch (e) {}
    }
};

export default statusReactWorker;
