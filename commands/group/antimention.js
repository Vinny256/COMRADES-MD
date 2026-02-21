const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = {
    name: 'antimention',
    category: 'group',
    desc: 'Kick users who mention the group in their status',
    async execute(sock, msg, args, { from, isGroup, isAdmins, settings }) {
        // 1. Check if the command is used in a group
        if (!isGroup) return sock.sendMessage(from, { text: vStyle("This protection is for Groups only.") });
        
        // 2. Check if the sender is an Admin
        if (!isAdmins) return sock.sendMessage(from, { text: vStyle("Access Denied. Only Group Admins can toggle Anti-Mention.") });

        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            if (settings.antimention) return sock.sendMessage(from, { text: vStyle("Anti-Mention is already active.") });
            
            settings.antimention = true;
            await sock.sendMessage(from, { 
                text: vStyle("🛡️ *Anti-Mention Activated*\n┃ Status mentions of this group\n┃ will result in an automatic kick.\n┃ _Lesson Teaching Mode: ON_") 
            });

        } else if (action === 'off') {
            settings.antimention = false;
            await sock.sendMessage(from, { 
                text: vStyle("🔓 *Anti-Mention Deactivated*\n┃ Status mentions will no longer\n┃ trigger automatic removal.") 
            });

        } else {
            // Usage instructions if no argument is provided
            await sock.sendMessage(from, { 
                text: vStyle(`Usage:\n┃ .antimention on\n┃ .antimention off\n┃\n┃ _Note: Bot must be Admin to kick._`) 
            });
        }
    }
};