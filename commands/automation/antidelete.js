const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = {
    name: "antidelete",
    category: "automation",
    description: "Configure Anti-Delete behavior and routing",
    async execute(sock, msg, args, { from, prefix }) {
        // 1. Load Current Settings
        let settings = {};
        if (fs.existsSync(settingsFile)) {
            settings = fs.readJsonSync(settingsFile);
        }

        const mode = args[0]?.toLowerCase(); // all, groups, inbox, off
        const dest = args[1]?.toLowerCase(); // chat, inbox

        // 2. Styling and Usage Guide
        const vStyle = (text) => `╭─── ~✾~ *VINNIE HUB* ~✾~ ───\n│\n${text}\n│\n╰─── ~✾~ *Anti-Delete* ~✾~ ───`;

        if (!mode || !['all', 'groups', 'inbox', 'off'].includes(mode)) {
            const usage = `│  💡 *Usage:* ${prefix}antidelete [mode] [dest]\n` +
                          `│\n` +
                          `│  📡 *Modes:* \n` +
                          `│  ◦  *all* : Monitor everywhere\n` +
                          `│  ◦  *groups* : Monitor groups only\n` +
                          `│  ◦  *inbox* : Monitor DMs only\n` +
                          `│  ◦  *off* : Disable system\n` +
                          `│\n` +
                          `│  🚚 *Destinations:* \n` +
                          `│  ◦  *chat* : Restore in the same chat\n` +
                          `│  ◦  *inbox* : Restore silently to your DM`;
            
            return sock.sendMessage(from, { text: vStyle(usage) }, { quoted: msg });
        }

        // 3. Update Settings
        settings.antidelete = {
            mode: mode,
            dest: dest && ['chat', 'inbox'].includes(dest) ? dest : (settings.antidelete?.dest || 'chat')
        };

        fs.writeJsonSync(settingsFile, settings);

        // 4. Success Reaction and Confirmation
        await sock.sendMessage(from, { react: { text: "🕵️‍♂️", key: msg.key } });

        const confirmation = `│  ✅ *Status:* ${mode.toUpperCase()}\n` +
                             `│  🚚 *Routing:* ${settings.antidelete.dest.toUpperCase()}\n` +
                             `│\n` +
                             `│  🚀 _Vinnie Hub is now monitoring._`;

        return sock.sendMessage(from, { text: vStyle(confirmation) }, { quoted: msg });
    }
};
