const { exec } = require('child_process');

module.exports = {
    name: "$", // Short name for quick use, e.g., $ ls
    category: "founder",
    desc: "V_HUB: Terminal Access",
    async execute(sock, msg, args, { from, isMe }) {
        // --- 🛡️ FOUNDER LOCK ---
        if (!isMe) return;

        const command = args.join(" ");
        if (!command) return sock.sendMessage(from, { text: "✿ *V_HUB:* Command required." });

        // React to show the terminal is processing
        await sock.sendMessage(from, { react: { text: "🖥️", key: msg.key } });

        // Execute the command in the server environment
        exec(command, (err, stdout, stderr) => {
            if (err) {
                return sock.sendMessage(from, { 
                    text: `┏━━━━━ ✿ *SHELL ERROR* ✿ ━━━━━┓\n\n❌ *Error:*\n${err.message}\n\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                });
            }

            // Combine standard output and error output
            const output = stdout || stderr || "✅ Command executed (No output)";

            sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *TERMINAL* ✿ ━━━━━┓\n\n💻 *Result:*\n${output}\n\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        });
    }
};
