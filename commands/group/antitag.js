const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = {
    name: 'antitag',
    category: 'group',
    desc: 'Stop mass mentions like @everyone or @all',
    async execute(sock, msg, args, { from, isGroup, botNumber, isAdmins, settings }) {
        if (!isGroup) return sock.sendMessage(from, { text: vStyle("This feature is for Groups only.") });
        
        // 1. Only Admins can change the setting
        if (!isAdmins) return sock.sendMessage(from, { text: vStyle("Access Denied. Only Group Admins can toggle Anti-Tag.") });

        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            settings.antitag = true;
            await sock.sendMessage(from, { 
                text: vStyle("🛡️ *Anti-Tag Activated*\n┃ Mass mentions (@everyone/@all)\n┃ will be automatically purged.") 
            });

        } else if (action === 'off') {
            settings.antitag = false;
            await sock.sendMessage(from, { 
                text: vStyle("🔓 *Anti-Tag Deactivated*\n┃ Mass mentions are now allowed.") 
            });

        } else {
            await sock.sendMessage(from, { text: vStyle(`Usage:\n┃ .antitag on\n┃ .antitag off`) });
        }
    }
};