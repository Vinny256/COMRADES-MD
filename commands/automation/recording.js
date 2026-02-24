const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "recording",
    category: "automation",
    desc: "V_HUB: Toggle Recording Worker",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        // --- 🛡️ FOUNDER SHIELD ---
        if (!isMe) {
            return await sock.sendMessage(from, { 
                text: "⚠️ *ACCESS DENIED*\n\nThis command is reserved for the *Vinnie Digital Hub* Founder only. 🛡️" 
            });
        }

        const settings = fs.readJsonSync(settingsFile);
        const choice = args[0]?.toLowerCase();

        // --- 🚥 MENU IF NO ARGS ---
        if (!choice) {
            await sock.sendMessage(from, { react: { text: "🎙️", key: msg.key } });

            const menu = `┏━━━━━ ✿ *V_HUB RECORDING* ✿ ━━━━━┓
┃
┃ 🎙️ *Status:* ${settings.alwaysRecording ? "ENABLED ✅" : "DISABLED ❌"}
┃ 📍 *Mode:* ${settings.recordMode || "all"}
┃
┃ *Usage:*
┃ 1️⃣ \`${prefix}recording all\`
┃ 2️⃣ \`${prefix}recording groups\`
┃ 3️⃣ \`${prefix}recording inbox\`
┃ 4️⃣ \`${prefix}recording off\`
┃
┃ _V_HUB Automation Engine_
┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            return await sock.sendMessage(from, { text: menu });
        }

        // --- ⚙️ LOGIC (NO DELETIONS) ---
        if (choice === 'off') {
            settings.alwaysRecording = false;
        } else if (['all', 'groups', 'inbox'].includes(choice)) {
            settings.alwaysRecording = true;
            settings.recordMode = choice;
            settings.alwaysTyping = false; 
        } else {
            return await sock.sendMessage(from, { text: "❌ Error: Use all, groups, inbox, or off." });
        }

        // Save and Sync
        fs.writeJsonSync(settingsFile, settings, { spaces: 2 });
        if (global.saveSettings) await global.saveSettings();

        // Success Feedback
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
        
        const successMsg = `┏━━━━━ ✿ *HUB UPDATED* ✿ ━━━━━┓
┃
┃ 🎙️ *Recording:* ${settings.alwaysRecording ? "ACTIVE" : "OFF"}
┃ 📡 *Target:* ${settings.recordMode?.toUpperCase() || "NONE"}
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sock.sendMessage(from, { text: successMsg });
    }
};
