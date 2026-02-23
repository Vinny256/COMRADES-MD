const fs = require('fs-extra');
const settingsFile = './settings.json';

const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

if (!global.msgStorage) global.msgStorage = {};

module.exports = async (sock, msg) => {
    try {
        const from = msg.key.remoteJid;
        const msgId = msg.key.id;

        // 🛡️ IGNORE SELF-STATUS: Stop log clutter
        if (from === 'status@broadcast' && msg.key.participant?.includes('254768666068')) {
            return;
        }

        // 1. ROBUST STORAGE
        if (msg.message && !msg.message.protocolMessage) {
            // Store a deep copy of the message immediately
            global.msgStorage[msgId] = JSON.parse(JSON.stringify(msg));
            
            // Auto-clean memory (2 hours)
            setTimeout(() => { 
                if (global.msgStorage[msgId]) delete global.msgStorage[msgId]; 
            }, 7200000);
        }

        // 2. SETTINGS CHECK
        const currentSettings = fs.readJsonSync(settingsFile);
        if (!currentSettings.antidelete) return; 

        // 3. DETECTION
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

                await new Promise(res => setTimeout(res, 800));

                // 🚀 IMPROVED RESTORATION: Send actual content instead of copyNForward
                const mtype = Object.keys(originalMsg.message)[0];
                
                // If it's just text, send it simply
                if (mtype === 'conversation' || mtype === 'extendedTextMessage') {
                    const textContent = originalMsg.message.conversation || originalMsg.message.extendedTextMessage.text;
                    await sock.sendMessage(from, { text: `┃ *Deleted Content:* \n\n${textContent}` });
                } 
                // For everything else (Images, Video, Audio, Stickers)
                else {
                    // This uses a built-in Baileys relay to send the message back
                    // It is much more stable than copyNForward for deleted keys
                    await sock.sendMessage(from, { forward: originalMsg }, { quoted: originalMsg });
                }
                
                // Cleanup
                delete global.msgStorage[deletedId];
            }
        }
    } catch (err) {
        console.error("Antidelete Error:", err);
    }
};