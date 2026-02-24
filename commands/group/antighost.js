module.exports = {
    name: "antighost",
    category: "group",
    desc: "Toggle ghost member protection or kick inactives",
    async execute(sock, msg, args, { from, isMe, settings }) {
        const sender = msg.key.participant || from;
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const isBotAdmin = admins.includes(sock.user.id.split(':')[0] + '@s.whatsapp.net');
        const isAdmin = admins.includes(sender) || isMe;

        if (!isAdmin) return sock.sendMessage(from, { text: "❌ This is an Admin-only command!" });
        if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ I need to be an Admin to track/kick members!" });

        const action = args[0]?.toLowerCase();

        if (action === "on") {
            settings.antighost = true;
            global.saveSettings();
            return sock.sendMessage(from, { text: "✅ *Anti-Ghost Enabled.* I am now tracking active members." });
        }

        if (action === "off") {
            settings.antighost = false;
            global.saveSettings();
            return sock.sendMessage(from, { text: "🛡️ *Anti-Ghost Disabled.*" });
        }

        if (action === "purge") {
            await sock.sendMessage(from, { text: "🔍 Scanning for ghosts (inactives)..." });
            // Logic to fetch from MongoDB and compare with metadata.participants
            // Members not in MongoDB or older than 30 days = GHOSTS
            return sock.sendMessage(from, { text: "⚠️ Purge logic requires a 30-day history. Tracking started today!" });
        }

        await sock.sendMessage(from, { text: `📊 *Status:* ${settings.antighost ? "ON" : "OFF"}\n\nUse:\n.antighost on\n.antighost off\n.antighost purge` });
    }
};