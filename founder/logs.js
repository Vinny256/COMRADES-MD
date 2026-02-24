const { exec } = require('child_process');

module.exports = {
    name: "logs",
    category: "founder",
    desc: "V_HUB: View server logs",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;

        await sock.sendMessage(from, { react: { text: "📜", key: msg.key } });
        
        // On Heroku, we use 'tail'. On local, this might vary.
        exec('tail -n 20', (err, stdout, stderr) => {
            if (err) return sock.sendMessage(from, { text: `❌ Log Fetch Failed: ${err.message}` });
            
            const output = stdout || stderr || "No logs found.";
            sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *LOGS* ✿ ━━━━━┓\n\n${output}\n\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        });
    }
};
