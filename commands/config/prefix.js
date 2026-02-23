const fs = require('fs-extra');

module.exports = {
    name: "setprefix",
    category: "config",
    desc: "Change the bot command prefix",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;
        const newPrefix = args[0];
        if (!newPrefix) return sock.sendMessage(from, { text: "┃ Provide a prefix (e.g .setprefix !)" });

        process.env.PREFIX = newPrefix; // Temporary change for current session
        // Note: For permanent change, you'd update your .env or Mongo config
        await sock.sendMessage(from, { text: `✿ PREFIX_UPDATED ✿\n┃ New Prefix: *${newPrefix}*` });
    }
};