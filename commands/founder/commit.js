const { exec } = require('child_process');

module.exports = {
    name: "commit",
    category: "founder",
    desc: "V_HUB: Git commit & push",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;
        const message = args.join(" ") || "V_HUB Automated Update";

        await sock.sendMessage(from, { react: { text: "🚀", key: msg.key } });
        
        exec(`git add . && git commit -m "${message}" && git push`, (err, stdout, stderr) => {
            const output = stdout || stderr;
            sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *GIT PUSH* ✿ ━━━━━┓\n\n${output}\n\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        });
    }
};
