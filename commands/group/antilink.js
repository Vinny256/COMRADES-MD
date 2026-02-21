const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = {
    name: 'antilink',
    category: 'group',
    desc: 'Toggle link protection for the group',
    async execute(sock, msg, args, { from, isGroup, participants, botNumber, isAdmins, settings }) {
        if (!isGroup) return sock.sendMessage(from, { text: vStyle("This command can only be used in groups.") });
        
        // 1. Check if the user executing the command is an Admin
        if (!isAdmins) return sock.sendMessage(from, { text: vStyle("Access Denied. Only Group Admins can toggle Anti-Link.") });

        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            if (settings.antilink) return sock.sendMessage(from, { text: vStyle("Anti-Link is already enabled for this session.") });
            settings.antilink = true;
            await sock.sendMessage(from, { text: vStyle("🛡️ *Anti-Link Activated*\n┃ No external links allowed.\n┃ Violation = Automatic Deletion.") });

        } else if (action === 'off') {
            settings.antilink = false;
            await sock.sendMessage(from, { text: vStyle("🔓 *Anti-Link Deactivated*\n┃ Group members can now send links.") });

        } else {
            // This part handles the actual detection logic if passed from handler
            const textContent = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "");
            const hasLink = textContent.includes('http://') || textContent.includes('https://');

            if (hasLink && settings.antilink) {
                const groupMetadata = await sock.groupMetadata(from);
                const botMember = groupMetadata.participants.find(p => p.id === botNumber);
                const isBotAdmin = botMember?.admin !== null;
                
                const sender = msg.key.participant || msg.key.remoteJid;
                const isSenderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin !== null;

                // Case A: Sender is an Admin
                if (isSenderAdmin) {
                    return sock.sendMessage(from, { text: vStyle("⚠️ *Admin Detected*\n┃ I cannot delete this link\n┃ because the sender is an Admin.") });
                }

                // Case B: Bot is not Admin
                if (!isBotAdmin) {
                    return sock.sendMessage(from, { text: vStyle("🚫 *Power Needed*\n┃ I detected a forbidden link,\n┃ but I need to be *ADMIN* to delete it.") });
                }

                // Case C: Success - Bot is Admin & Sender is User
                try {
                    await sock.sendMessage(from, { delete: msg.key });
                    await sock.sendMessage(from, { 
                        text: vStyle("🗑️ *Link Purged*\n┃ A forbidden link was detected.\n┃ Privacy and security protocols\n┃ have removed the message.") 
                    });
                } catch (err) {
                    console.error("Antilink Err:", err);
                }
            } else {
                await sock.sendMessage(from, { text: vStyle(`Usage:\n┃ .antilink on\n┃ .antilink off`) });
            }
        }
    }
};