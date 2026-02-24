const fs = require('fs');

module.exports = {
    name: "ls",
    category: "founder",
    desc: "V_HUB: List directory files",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;

        await sock.sendMessage(from, { react: { text: "📂", key: msg.key } });
        const files = fs.readdirSync('./');
        const list = files.map(f => `📄 ${f}`).join('\n');

        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *FILES* ✿ ━━━━━┓\n┃\n${list}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });
    }
};
