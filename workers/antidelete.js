const fs = require('fs-extra');
const settingsFile = './settings.json';

const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

if (!global.msgStorage) global.msgStorage = {};

module.exports = async (sock, msg) => {
    try {
        const from = msg.key.remoteJid;
        const msgId = msg.key.id;

        // 🛡️ IGNORE SELF-STATUS: Stop log clutter from your own number (254768666068)
        if (from === 'status@broadcast' && msg.key.participant?.includes('254768666068')) {
            return;
        }

        // 1. ROBUST STORAGE
        // Capture message content immediately if it exists
        if (msg.message && !msg.message.protocolMessage) {
            global.msgStorage[msgId] = JSON.parse(JSON.stringify(msg));
            
            // Auto-clean memory (2 hours)
            setTimeout(() => { 
                if (global.msgStorage[msgId]) delete global.msgStorage[msgId]; 
            }, 7200000);
        }

        // 2. SETTINGS CHECK (Fresh read from disk)
        const currentSettings = fs.readJsonSync(settingsFile);
        if (!currentSettings.antidelete) return; 

        // 3. RESTORATION LOGIC
        // Detection for WhatsApp "Delete for Everyone"
        const isRevoke = msg.message?.protocolMessage && msg.message.protocolMessage.type === 0;
        
        if (isRevoke) {
            const deletedId = msg.message.protocolMessage.key.id;
            const originalMsg = global.msgStorage[deletedId];

            if (originalMsg) {
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                
                // Alert the chat
                await sock.sendMessage(from, { 
                    text: vStyle(`🚫 *V_HUB ANTIDELETE*\n┃ User: @${sender.split('@')[0]}\n┃ Action: Delete Attempt\n┃ Status: *RESTORED*`),
                    mentions: [sender]
                });

                // Small jitter to prevent decryption collisions
                await new Promise(res => setTimeout(res, 800));

                // Restore the message content
                await sock.copyNForward(from, originalMsg, false);
                
                // Remove from memory once restored to keep it lean
                delete global.msgStorage[deletedId];
            }
        }
    } catch (err) {
        // Silent catch to prevent crashing the main Hub during Bad MACs
    }
};