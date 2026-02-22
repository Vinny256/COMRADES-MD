const fs = require('fs-extra');
const settingsFile = './settings.json';

const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = {
    name: 'antimention',
    category: 'group',
    desc: 'Kick users who mention the group in status',
    async execute(sock, msg, args, { from, isGroup, isAdmins, settings }) {
        if (!isGroup) return sock.sendMessage(from, { text: vStyle("This protection is for Groups only.") });
        if (!isAdmins) return sock.sendMessage(from, { text: vStyle("Access Denied. Only Group Admins can toggle Anti-Mention.") });

        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            settings.antimention = true;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { 
                text: vStyle("🛡️ *Anti-Mention Activated*\n┃ Status mentions of this group\n┃ will result in an automatic kick.\n┃ _Lesson Teaching Mode: ON_") 
            });
        } else if (action === 'off') {
            settings.antimention = false;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { 
                text: vStyle("🔓 *Anti-Mention Deactivated*\n┃ Status mentions will no longer\n┃ trigger automatic removal.") 
            });
        } else {
            await sock.sendMessage(from, { text: vStyle(`Usage:\n┃ .antimention on\n┃ .antimention off`) });
        }
    }
};