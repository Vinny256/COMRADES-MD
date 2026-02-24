const util = require('util');

module.exports = {
    name: "eval",
    category: "founder",
    desc: "V_HUB: Execute raw JS code",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return; 
        if (!args[0]) return sock.sendMessage(from, { text: "✿ *V_HUB:* Provide code to execute." });

        await sock.sendMessage(from, { react: { text: "💻", key: msg.key } });
        
        try {
            let evaled = await eval(args.join(" "));
            if (typeof evaled !== "string") evaled = util.inspect(evaled);
            await sock.sendMessage(from, { text: `┏━━━━━ ✿ *EVAL* ✿ ━━━━━┓\n\n${evaled}\n\n┗━━━━━━━━━━━━━━━━━━━━━━┛` });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ *ERROR:*\n\n${err.message}` });
        }
    }
};
