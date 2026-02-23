const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

if (!global.msgStorage) global.msgStorage = {};

module.exports = async (sock, msg, settings) => {
    try {
        const from = msg.key.remoteJid;

        // 1. STORAGE LOGIC (Capture every message)
        if (msg.message && !msg.message.protocolMessage) {
            const msgId = msg.key.id;
            // Store a deep copy so Baileys doesn't mutate it
            global.msgStorage[msgId] = JSON.parse(JSON.stringify(msg));
            
            // Cleanup after 2 hours
            setTimeout(() => { if(global.msgStorage[msgId]) delete global.msgStorage[msgId]; }, 7200000);
        }

        // 2. DETECTION LOGIC (The "Universal" Catch)
        // Check if the message is a Protocol Message and specifically a 'REVOKE' (type 0)
        const isRevoke = msg.message?.protocolMessage && msg.message.protocolMessage.type === 0;
        const isStubDelete = msg.messageStubType === 68;

        if (settings.antidelete && (isRevoke || isStubDelete)) {
            
            // Extract the ID of the message being revoked
            const deletedId = isRevoke ? msg.message.protocolMessage.key.id : msg.key.id;
            const originalMsg = global.msgStorage[deletedId];

            if (originalMsg) {
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                
                // 3. SEND RESTORATION LOG
                await sock.sendMessage(from, { 
                    text: vStyle(`🚫 *V_HUB ANTIDELETE*\n┃ User: @${sender.split('@')[0]}\n┃ Action: Delete Attempt\n┃ Status: *RESTORED*`),
                    mentions: [sender]
                });

                // Small delay to ensure the store isn't busy
                await new Promise(resolve => setTimeout(resolve, 500));

                // 4. RESTORE CONTENT
                await sock.copyNForward(from, originalMsg, false);
                
                // Cleanup to prevent double-restoring
                delete global.msgStorage[deletedId];
                console.log(`✿ HUB_SYNC ✿ Antidelete: Recovered ${deletedId}`);
            } else {
                // This logs to your terminal if the message was too old or missed
                console.log(`✿ HUB_SYNC ✿ Antidelete: Could not find ${deletedId} in memory.`);
            }
        }
    } catch (err) {
        console.error("Antidelete Module Error:", err);
    }
};