const { exec } = require('child_process');

module.exports = {
    name: "logs",
    category: "founder",
    desc: "V_HUB: View server logs",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) {
            // Your new vocal security fallback
            return sock.sendMessage(from, { 
                text: "┏━━━━━ ✿ *V_HUB SECURITY* ✿ ━━━━━┓\n┃\n┃ 🛡️ *ACCESS DENIED*\n┃ ⚠️ *Note:* Log access is founder-only.\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛" 
            });
        }

        await sock.sendMessage(from, { react: { text: "📜", key: msg.key } });
        
        // We attempt to read from standard linux log locations or the app's output
        // On Heroku, 'heroku logs' isn't available inside the dyno, 
        // but sometimes logs are piped to a temporary file.
        exec('tail -n 20 /app/.logs 2>/dev/null || tail -n 20 logs.txt 2>/dev/null || echo "No log file found. Check Heroku Dashboard."', (err, stdout, stderr) => {
            
            const output = stdout || stderr || "No logs captured in file.";
            
            sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *LOGS* ✿ ━━━━━┓\n\n${output.trim()}\n\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        });
    }
};
