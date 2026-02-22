const fs = require('fs-extra');
const settingsFile = './settings.json';

const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = {
    name: 'antidelete',
    category: 'automation',
    desc: 'Catch deleted messages',
    async execute(sock, msg, args, { from, settings }) {
        if (!msg.key.fromMe) return;

        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            settings.antidelete = true;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { text: vStyle("🛡️ *Antidelete Activated*\n┃ Nothing stays hidden.\n┃ Deleted messages will be caught.") });
        } else if (action === 'off') {
            settings.antidelete = false;
            fs.writeJsonSync(settingsFile, settings);
            await sock.sendMessage(from, { text: vStyle("🔓 *Antidelete Deactivated*\n┃ Messages can now be deleted\n┃ without being recovered.") });
        } else {
            await sock.sendMessage(from, { text: vStyle(`Usage:\n┃ .antidelete on\n┃ .antidelete off`) });
        }
    }
};