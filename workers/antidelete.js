const fs = require('fs-extra');
const settingsFile = './settings.json';

// V_HUB Styling for public/shout mode
const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

if (!global.msgStorage) global.msgStorage = {};

module.exports = async (sock, msg) => {
    try {
        const from = msg.key.remoteJid;
        const msgId = msg.key.id;
        const isGroup = from.endsWith('@g.us');

        // 🛡️ IGNORE SELF-STATUS & LOG CLUTTER
        if (from === 'status@broadcast') return;

        // 1. ROBUST STORAGE (Always running in background)
        if (msg.message && !msg.message.protocolMessage) {
            global.msgStorage[msgId] = JSON.parse(JSON.stringify(msg));
            setTimeout(() => { 
                if (global.msgStorage[msgId]) delete global.msgStorage[msgId]; 
            }, 7200000); // 2 Hours
        }

        // 2. SMART SETTINGS CHECK
        const currentSettings = fs.readJsonSync(settingsFile);
        const config = currentSettings.antidelete || { mode: 'off', dest: 'chat' };

        // Exit if Anti-delete is off or if it doesn't match the current chat type
        if (config.mode === 'off') return;
        if (config.mode === 'groups' && !isGroup) return;
        if (config.mode === 'inbox' && isGroup) return;

        // 3. DETECTION OF DELETE (Protocol Message Type 0)
        const isRevoke = msg.message?.protocolMessage && msg.message.protocolMessage.type === 0;
        
        if (isRevoke) {
            const deletedId = msg.message.protocolMessage.key.id;
            const originalMsg = global.msgStorage[deletedId];

            if (originalMsg) {
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                
                // --- 🎯 ROUTING LOGIC ---
                // If dest is 'inbox', send it to your personal DM. Otherwise, the current chat.
                const targetChat = config.dest === 'inbox' ? sock.user.id : from;
                
                // --- 🤫 QUIET LOGIC ---
                // Shout only if it's a group AND destination is 'chat'. 
                // Otherwise (Private DM or Inbox Routing), stay quiet.
                const isSilent = !isGroup || config.dest === 'inbox';

                if (isSilent) {
                    await sock.sendMessage(targetChat, { 
                        text: `*『 RESTORED 』*\n👤 *From:* @${sender.split('@')[0]}`,
                        mentions: [sender]
                    });
                } else {
                    await sock.sendMessage(targetChat, { 
                        text: vStyle(`🚫 *V_HUB ANTIDELETE*\n┃ User: @${sender.split('@')[0]}\n┃ Action: Delete Attempt\n┃ Status: *RESTORED*`),
                        mentions: [sender]
                    });
                }

                await new Promise(res => setTimeout(res, 500));

                // 🚀 RESTORATION
                const mtype = Object.keys(originalMsg.message)[0];
                
                if (mtype === 'conversation' || mtype === 'extendedTextMessage') {
                    const textContent = originalMsg.message.conversation || originalMsg.message.extendedTextMessage.text;
                    await sock.sendMessage(targetChat, { text: `┃ *Content:* ${textContent}` });
                } else {
                    // For Media: Forward it so it loads correctly
                    await sock.sendMessage(targetChat, { forward: originalMsg }, { quoted: originalMsg });
                }
                
                delete global.msgStorage[deletedId];
            }
        }
    } catch (err) {
        console.error("Antidelete Error:", err);
    }
};
