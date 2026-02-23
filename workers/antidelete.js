const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

// Global memory store to preserve messages across worker calls
if (!global.msgStorage) global.msgStorage = {};

module.exports = async (sock, msg, settings) => {
    try {
        const from = msg.key.remoteJid;

        // 1. 🛡️ THE SAVER: Store every message as it arrives
        // We ignore protocolMessages because they are just 'notifications' of a delete
        if (msg.message && !msg.message.protocolMessage) {
            const msgId = msg.key.id;
            
            // Deep copy to prevent Baileys from mutating the object in memory
            global.msgStorage[msgId] = JSON.parse(JSON.stringify(msg));
            
            // Auto-clean memory every 2 hours (1000 * 60 * 60 * 2)
            setTimeout(() => { 
                if (global.msgStorage[msgId]) delete global.msgStorage[msgId]; 
            }, 7200000);
        }

        // 2. 🛰️ THE DETECTOR: Check for Revoke (Delete) events
        const isRevoke = msg.message?.protocolMessage && msg.message.protocolMessage.type === 0;
        
        // StubType 68 is an older Baileys fallback for deletions
        const isStubDelete = msg.messageStubType === 68;

        if (settings.antidelete && (isRevoke || isStubDelete)) {
            
            // Extract the actual ID of the message that was deleted
            const deletedId = isRevoke ? msg.message.protocolMessage.key.id : msg.key.id;
            const originalMsg = global.msgStorage[deletedId];

            if (originalMsg) {
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                
                // --- 🚨 V_HUB RESTORATION LOG ---
                await sock.sendMessage(from, { 
                    text: vStyle(`🚫 *V_HUB ANTIDELETE*\n┃ User: @${sender.split('@')[0]}\n┃ Action: Message Deleted\n┃ Status: *RESTORED BELOW*`),
                    mentions: [sender]
                });

                // Small delay to let the socket breathe before forwarding
                await new Promise(resolve => setTimeout(resolve, 500));

                // --- 📦 FORWARD THE GHOST MESSAGE ---
                await sock.copyNForward(from, originalMsg, false);
                
                // Clean up now that it's caught
                delete global.msgStorage[deletedId];
                
                console.log(`🚀 [V_HUB] Antidelete: Successfully restored message ${deletedId}`);
            } else {
                // If it wasn't in storage, it's either too old or was sent before the bot started
                console.log(`🚀 [V_HUB] Antidelete: Message ${deletedId} not found in local memory.`);
            }
        }
    } catch (err) {
        // Silent error to avoid breaking your Queen Healer / Task Queue
    }
};