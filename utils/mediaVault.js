const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

class MediaVault {
    /**
     * Extracts ViewOnce media into a RAM buffer and resends it.
     * @param {Object} sock - Baileys socket
     * @param {Object} msg - The original message object
     * @param {Object} vMessage - The extracted viewOnce message content
     */
    static async extract(sock, msg, vMessage) {
        try {
            const mType = Object.keys(vMessage)[0];
            const cleanType = mType.replace('Message', '');
            const from = msg.key.remoteJid;

            // Download to RAM Buffer
            const stream = await downloadContentFromMessage(vMessage[mType], cleanType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const caption = `┏━━━━━ ✿ *V_HUB_VAULT* ✿ ━━━━━┓\n┃\n┃ ✅ *MEDIA EXTRACTED*\n┃ 👤 *USER:* ${msg.pushName || 'Member'}\n┃ 📂 *TYPE:* ${cleanType.toUpperCase()}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

            await sock.sendMessage(from, { 
                [cleanType]: buffer, 
                caption: vMessage[mType].caption || caption 
            }, { quoted: msg });

            // GC: Force memory release
            buffer = null;
            return true;
        } catch (e) {
            console.error("┃ ❌ VAULT_ERROR:", e.message);
            return false;
        }
    }
}

module.exports = MediaVault;