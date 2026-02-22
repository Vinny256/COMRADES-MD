const fs = require('fs-extra');
const settingsFile = './settings.json';

const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = {
    name: 'antilink',
    category: 'group',
    desc: 'Toggle link protection',
    async execute(sock, msg, args, { from, isGroup, isAdmins, settings }) {
        if (!isGroup) return sock.sendMessage(from, { text: vStyle("This command can only be used in groups.") });
        if (!isAdmins) return sock.sendMessage(from, { text: vStyle("Access Denied. Only Group Admins can toggle Anti-Link.") });

        const action = args[0]?.toLowerCase();
        if (action === 'on') {
            settings.antilink = true;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { text: vStyle("🛡️ *Anti-Link Activated*\n┃ No external links allowed.\n┃ Violation = Automatic Deletion.") });
        } else if (action === 'off') {
            settings.antilink = false;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { text: vStyle("🔓 *Anti-Link Deactivated*\n┃ Group members can now send links.") });
        } else {
            await sock.sendMessage(from, { text: vStyle(`Usage:\n┃ .antilink on\n┃ .antilink off`) });
        }
    }
};