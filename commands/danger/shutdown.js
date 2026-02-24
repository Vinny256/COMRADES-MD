module.exports = {
    name: "shutdown",
    category: "danger",
    desc: "V_HUB: Emergency Stop",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;

        await sock.sendMessage(from, { react: { text: "🛑", key: msg.key } });
        
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ ☢️ *PROTOCOL:* Nuclear Shutdown\n┃ ⚠️ *Status:* Immediate Termination\n┃ 🔌 *Power:* Cutting Grid...\n┃\n┃ _System offline. Manual boot required._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        // This kills the bot. 
        // Warning: Heroku might try to restart it unless you scale the dyno to 0.
        setTimeout(() => {
            process.exit(1); 
        }, 3000);
    }
};
