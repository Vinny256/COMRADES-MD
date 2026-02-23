const fs = require('fs-extra');
const settingsFile = './settings.json';

const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

if (!global.msgStorage) global.msgStorage = {};

module.exports = async (sock, msg) => { // Removed 'settings' from here to force fresh read
    try {
        const from = msg.key.remoteJid;

        // 1. ALWAYS STORE (Even if antidelete is OFF, we store so we can catch it if turned ON)
        if (msg.message && !msg.message.protocolMessage) {
            const msgId = msg.key.id;
            global.msgStorage[msgId] = JSON.parse(JSON.stringify(msg));
            setTimeout(() => { if (global.msgStorage[msgId]) delete global.msgStorage[msgId]; }, 7200000);
        }

        // 2. FRESH READ: Check the actual file status right now
        const currentSettings = fs.readJsonSync(settingsFile);
        if (!currentSettings.antidelete) return; 

        // 3. DETECTION
        const isRevoke = msg.message?.protocolMessage && msg.message.protocolMessage.type === 0;
        if (isRevoke) {
            const deletedId = msg.message.protocolMessage.key.id;
            const originalMsg = global.msgStorage[deletedId];

            if (originalMsg) {
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                
                await sock.sendMessage(from, { 
                    text: vStyle(`🚫 *V_HUB ANTIDELETE*\n┃ User: @${sender.split('@')[0]}\n┃ Action: Delete Attempt\n┃ Status: *RESTORED*`),
                    mentions: [sender]
                });

                await new Promise(res => setTimeout(res, 500));
                await sock.copyNForward(from, originalMsg, false);
                delete global.msgStorage[deletedId];
            }
        }
    } catch (err) { }
};