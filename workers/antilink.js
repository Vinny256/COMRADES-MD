const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = async (sock, msg, settings) => {
    try {
        if (!settings.antilink) return;
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const textContent = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || "");
        const hasLink = textContent.includes('chat.whatsapp.com') || textContent.includes('http://') || textContent.includes('https://');

        if (hasLink) {
            const groupMetadata = await sock.groupMetadata(from);
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const participants = groupMetadata.participants;
            
            const botMember = participants.find(p => p.id === botNumber);
            // Fix: Check specifically for 'admin' or 'superadmin' string from Baileys
            const isBotAdmin = botMember?.admin === 'admin' || botMember?.admin === 'superadmin';

            const sender = msg.key.participant || msg.key.remoteJid;
            const senderMember = participants.find(p => p.id === sender);
            const isSenderAdmin = senderMember?.admin === 'admin' || senderMember?.admin === 'superadmin';

            // --- 🛡️ VOCAL LOGIC ENGINE ---

            // Case 1: Sender is Admin (Quote the link and notify)
            if (isSenderAdmin) {
                return sock.sendMessage(from, { 
                    text: vStyle("⚠️ *Admin Detected*\n┃ I detected a link, but since\n┃ you are an ADMIN, I have\n┃ bypassed the deletion protocol.") 
                }, { quoted: msg }); // Added quoting here
            }

            // Case 2: Bot is NOT Admin (Quote the link and ask for power)
            if (!isBotAdmin) {
                return sock.sendMessage(from, { 
                    text: vStyle("🚫 *Power Needed*\n┃ I detected a forbidden link,\n┃ but I am NOT an ADMIN.\n┃ Promote me to enforce rules!") 
                }, { quoted: msg }); // Added quoting here
            }

            // Case 3: Success (Bot is Admin & Sender is User)
            // Step A: Send the warning message first (WHILE THE LINK STILL EXISTS)
            await sock.sendMessage(from, { 
                text: vStyle("🗑️ *Link Purged*\n┃ A forbidden link was detected.\n┃ Privacy and security protocols\n┃ have removed the message.") 
            }, { quoted: msg }); // Added quoting here

            // Step B: Delete the link message immediately after
            await sock.sendMessage(from, { delete: msg.key });
            
            console.log(`✿ HUB_SYNC ✿ Antilink Action Taken in ${groupMetadata.subject}`);
        }
    } catch (err) { 
        console.error("Antilink Worker Error:", err);
    }
};
