module.exports = {
    name: 'autosave',
    category: 'automation',
    async execute(sock, msg, args) {
        const senderNumber = (msg.key.participant || msg.key.remoteJid).split('@')[0];
        const action = args[0]?.toLowerCase();

        global.optOutStatus = global.optOutStatus || new Set();

        if (action === 'off') {
            global.optOutStatus.add(senderNumber);
            return sock.sendMessage(msg.key.remoteJid, { text: "✅ *ᴀᴜᴛᴏsᴀᴠᴇ ᴏꜰꜰ:* I will no longer save your statuses." });
        } else if (action === 'on') {
            global.optOutStatus.delete(senderNumber);
            return sock.sendMessage(msg.key.remoteJid, { text: "✅ *ᴀᴜᴛᴏsᴀᴠᴇ ᴏɴ:* Status saving resumed." });
        } else {
            return sock.sendMessage(msg.key.remoteJid, { text: "❓ Use `.autosave off` or `.autosave on`" });
        }
    }
};
