const MediaVault = require('../../utils/mediaVault');

module.exports = {
    name: 'vv',
    category: 'utility',
    async execute(sock, m, args) {
        const remoteJid = m.key.remoteJid;
        
        // 1. Check if user is replying to a message
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(remoteJid, { text: "❌ *V_HUB:* Please reply to a ViewOnce message with `.vv`" });
        }

        // 2. Identify ViewOnce content
        const vData = quoted.viewOnceMessageV2 || quoted.viewOnceMessage;
        if (!vData) {
            return sock.sendMessage(remoteJid, { text: "⚠️ *V_HUB:* This is not a ViewOnce message." });
        }

        // 3. Call the Vault Utility
        const success = await MediaVault.extract(sock, m, vData.message);
        
        if (!success) {
            await sock.sendMessage(remoteJid, { text: "❌ *V_HUB:* Failed to extract media. It might have expired." });
        }
    }
};