const vStyle = (text) => {
    return `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n┃  ${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
};

module.exports = async (sock, msg, settings) => {
    try {
        if (!settings.antimention) return;

        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        // --- 🔍 STATUS TAG DETECTION ---
        // stubType 131 is the official Baileys/WA code for "Group mentioned in status"
        const isStatusTag = msg.messageStubType === 131;

        if (isStatusTag) {
            const groupMetadata = await sock.groupMetadata(from);
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            const participants = groupMetadata.participants;
            const botMember = participants.find(p => p.id === botNumber);
            const isBotAdmin = botMember?.admin || botMember?.ismediator || false;

            // Extract the person who made the mention
            const sender = msg.key.participant || msg.messageStubParameters[0]; 
            const senderMember = participants.find(p => p.id === sender);
            const isSenderAdmin = senderMember?.admin || senderMember?.ismediator || false;

            // --- 🚥 SCENARIO 1: BOT IS NOT ADMIN ---
            if (!isBotAdmin) {
                return sock.sendMessage(from, { 
                    text: vStyle("🚫 *Power Needed*\n┃ I detected a Status Mention,\n┃ but I am NOT an ADMIN.\n┃ Promote me to kick the violator!") 
                });
            }

            // --- 🚥 SCENARIO 2: SENDER IS ADMIN ---
            if (isSenderAdmin) {
                return sock.sendMessage(from, { 
                    text: vStyle("⚠️ *Admin Bypass*\n┃ An admin mentioned this group\n┃ in their status. Protection\n┃ protocol ignored.") 
                });
            }

            // --- 🚥 SCENARIO 3: SUCCESS (KICK USER) ---
            await sock.sendMessage(from, { 
                text: vStyle(`🚫 *Protocol: Lesson Taught*\n┃ User @${sender.split('@')[0]}\n┃ mentioned this group in status.\n┃ *ACTION:* Terminated.`),
                mentions: [sender]
            });

            // Delay kick slightly to ensure message is sent (Better for Bad MAC safety)
            await new Promise(res => setTimeout(res, 1000));
            await sock.groupParticipantsUpdate(from, [sender], "remove");
            
            console.log(`✿ HUB_SYNC ✿ Anti-Mention Kick: ${sender} from ${groupMetadata.subject}`);
        }
    } catch (err) {
        console.error("Antimention Worker Error:", err);
    }
};