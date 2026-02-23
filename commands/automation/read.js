const fs = require('fs-extra');
const settingsFile = './settings.json';

const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

module.exports = {
    name: 'read',
    category: 'automation',
    desc: 'Toggle automatic message read (Blue Ticks)',
    async execute(sock, msg, args, { from, settings }) {
        if (!msg.key.fromMe) return;

        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            settings.autoread = true;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { text: vStyle("🔵 *Auto-Read ON*\n┃ Bot will now mark all\n┃ messages as read instantly.") });
        } else if (action === 'off') {
            settings.autoread = false;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { text: vStyle("⚪ *Auto-Read OFF*\n┃ Bot will no longer mark\n┃ messages as read.") });
        } else {
            const status = settings.autoread ? "ON" : "OFF";
            await sock.sendMessage(from, { text: vStyle(`Current Status: *${status}*\n┃ Usage:\n┃ .read on\n┃ .read off`) });
        }
    }
};