module.exports = {
    name: "reboot",
    category: "founder",
    desc: "V_HUB: System Refresh",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;

        await sock.sendMessage(from, { react: { text: "🔄", key: msg.key } });
        
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ 🔄 *PROTOCOL:* System Reboot\n┃ ⚙️ *Action:* Killing Process...\n┃ ⏳ *Wait:* Heroku will restart shortly.\n┃\n┃ _Standby for Grid Sync._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        // Small delay so the message actually sends before the bot dies
        setTimeout(() => {
            process.exit(0); 
        }, 3000);
    }
};
