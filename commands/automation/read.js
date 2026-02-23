const fs = require('fs-extra');
const settingsFile = './settings.json';

const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

module.exports = {
    name: 'read',
    category: 'automation',
    desc: 'Toggle automatic message read (Owners Only)',
    async execute(sock, msg, args, { from, settings }) {
        // 🛡️ OWNER SHIELD: Get owners from .env
        const rawOwners = process.env.OWNER || "";
        const owners = rawOwners.split(',').map(num => num.trim() + "@s.whatsapp.net");
        const sender = msg.key.participant || msg.key.remoteJid;

        // Check if sender is an owner or the bot itself
        if (!owners.includes(sender) && !msg.key.fromMe) {
            return await sock.sendMessage(from, { text: vStyle("⚠️ *Access Denied*\n┃ This command is reserved\n┃ for V_HUB Owners only.") });
        }

        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            settings.autoread = true;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { text: vStyle("🔵 *Auto-Read ON*\n┃ Bot will now blue-tick\n┃ incoming messages.") });
        } else if (action === 'off') {
            settings.autoread = false;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { text: vStyle("⚪ *Auto-Read OFF*\n┃ Blue ticks disabled.") });
        } else {
            const status = settings.autoread ? "ON" : "OFF";
            await sock.sendMessage(from, { text: vStyle(`Current Status: *${status}*\n┃ Usage:\n┃ .read on\n┃ .read off`) });
        }
    }
};