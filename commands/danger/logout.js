module.exports = {
    name: "logout",
    category: "danger",
    desc: "V_HUB PROTOCOL: Self-Termination",
    async execute(sock, msg, args, { from, isMe }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // --- 1. OWNER-ONLY ACCESS ---
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *SYSTEM ALERT* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Status:* Unauthorized\n┃ 👤 *User:* @${sender.split('@')[0]}\n┃ ⚠️ *Action:* Attempted Self-Destruct\n┃\n┃ _Access denied by V_HUB Security._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // --- 2. TERMINATION SEQUENCE ---
        await sock.sendMessage(from, { react: { text: "🔌", key: msg.key } });
        
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ 🔌 *PROTOCOL:* Self-Termination\n┃ ⚙️ *Target:* Linked Device\n┃ ⏱️ *Countdown:* Now\n┃\n┃ _Unlinking session... Goodbye._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        // The actual logout command
        try {
            await sock.logout(); 
            // Note: After logout() the bot will disconnect and stay offline.
        } catch (e) {
            console.error("Logout Error:", e.message);
            await sock.sendMessage(from, { text: "✿ *ERROR:* Shutdown protocol failed." });
        }
    }
};
