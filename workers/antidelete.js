const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

// Global memory store
if (!global.msgStorage) global.msgStorage = {};

module.exports = async (sock, msg, settings) => {
    try {
        const from = msg.key.remoteJid;

        // 1. IMPROVED STORAGE: Capture every message properly
        if (msg.message) {
            // We store the actual message content linked to the ID
            const msgId = msg.key.id;
            global.msgStorage[msgId] = JSON.parse(JSON.stringify(msg)); // Deep clone to keep data safe
            
            // Clean memory after 2 hours
            setTimeout(() => { if(global.msgStorage[msgId]) delete global.msgStorage[msgId]; }, 7200000);
        }

        // 2. DETECT DELETION
        const isDelete = msg.messageStubType === 68 || 
                       (msg.message?.protocolMessage && msg.message.protocolMessage.type === 0);

        if (settings.antidelete && isDelete) {
            // Get the ID of the message that was actually deleted
            const deletedId = msg.message?.protocolMessage?.key?.id || msg.key.id;
            const originalMsg = global.msgStorage[deletedId];

            if (originalMsg) {
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                
                // --- V_HUB LOGGING ---
                await sock.sendMessage(from, { 
                    text: vStyle(`🚫 *ANTIDELETE CAUGHT*\n┃ User: @${sender.split('@')[0]}\n┃ Action: Message Deleted\n┃ Status: *RESTORED BELOW*`),
                    mentions: [sender]
                });

                // 3. THE FIX: Delay slightly to let the store catch up, then forward
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // copyNForward is good, but for some Baileys versions, we use this:
                await sock.copyNForward(from, originalMsg, false).catch(e => console.log("Forward error:", e));

                // Cleanup
                delete global.msgStorage[deletedId];
            } else {
                console.log(`✿ HUB_SYNC ✿ Antidelete: Message ID ${deletedId} not found in memory.`);
            }
        }
    } catch (err) { 
        console.error("Antidelete Error:", err);
    }
};