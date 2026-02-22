const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

// Temporary storage to keep track of messages
if (!global.msgStorage) global.msgStorage = {};

module.exports = async (sock, msg, settings) => {
    try {
        const from = msg.key.remoteJid;

        // 1. Store incoming messages so we can recover them later
        if (msg.message && !msg.key.fromMe) {
            const msgId = msg.key.id;
            global.msgStorage[msgId] = msg;
            
            // Auto-clean memory every 1 hour to prevent lag
            setTimeout(() => { delete global.msgStorage[msgId]; }, 3600000);
        }

        // 2. Logic: If Antidelete is ON and a message is deleted
        if (settings.antidelete && msg.messageStubType === 68 || msg.message?.protocolMessage?.type === 0) {
            
            const deletedId = msg.message?.protocolMessage?.key?.id || msg.key.id;
            const originalMsg = global.msgStorage[deletedId];

            if (originalMsg) {
                const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                
                // Alert you that a message was caught
                await sock.sendMessage(from, { 
                    text: vStyle(`🚫 *ANTIDELETE LOG*\n┃ User: @${sender.split('@')[0]}\n┃ tried to hide a message.\n┃\n┃ *RECOVERING CONTENT...*`),
                    mentions: [sender]
                });

                // Forward the original message back to the chat
                await sock.copyNForward(from, originalMsg, false);
                
                // Remove from storage now that it's caught
                delete global.msgStorage[deletedId];
                console.log(`✿ HUB_SYNC ✿ Antidelete: Caught message from ${sender}`);
            }
        }
    } catch (err) { }
};