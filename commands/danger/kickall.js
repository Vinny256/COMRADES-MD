module.exports = {
    name: "kickall",
    category: "danger",
    desc: "V_HUB PROTOCOL: Total Group Purge",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // --- 1. OWNER-ONLY ACCESS SHIELD ---
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "⚠️", key: msg.key } });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *V_HUB SECURITY* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Protocol:* Restricted (Nuclear)\n┃ 👤 *User:* @${sender.split('@')[0]}\n┃ ⚠️ *Note:* You do not have the \n┃      clearance for this protocol.\n┃\n┃ _Integrity Shield Active._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // --- 2. THE "MIRROR" ADMIN CHECK ---
        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];
        
        // Find the bot in the list by checking if the number matches
        // This avoids JID vs LID confusion
        const botNumber = sock.user.id.split(':')[0].split('@')[0];
        const botInGroup = participants.find(p => p.id.includes(botNumber));

        // If the bot exists in the group and has the 'admin' property (truthy)
        const botIsAdmin = botInGroup && !!botInGroup.admin;
        
        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { 
                text: "✿ *V_HUB ERROR* ✿\n\nI cannot execute the purge. Please promote me to **Admin** first." 
            });
        }

        // --- 3. TARGET FILTERING ---
        // Filter out the bot (using its group-specific ID) and the sender
        const toRemove = participants
            .map(p => p.id)
            .filter(id => id !== botInGroup.id && id !== sender);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, { text: "✿ *V_HUB INFO* ✿\n\nNo external members found to purge." });
        }

        // --- 4. INITIATION ---
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });
        
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ ☢️ *PROTOCOL:* Nuclear Purge\n┃ 👥 *Targets:* ${toRemove.length}\n┃ ⚡ *Status:* background_exec\n┃\n┃ _Bot remains active for others._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        // --- 5. BACKGROUND EXECUTION ---
        (async () => {
            let removedCount = 0;
            let totalToClear = toRemove.length;

            for (let i = 0; i < toRemove.length; i++) {
                try {
                    await sock.groupParticipantsUpdate(from, [toRemove[i]], "remove");
                    removedCount++;
                    
                    if (removedCount % 20 === 0) {
                        await sock.sendMessage(from, { 
                            text: `┏━━━━━ ✿ *PURGE UPDATE* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Removed:* ${removedCount}\n┃ ⏳ *Remaining:* ${totalToClear - removedCount}\n┃ ⚡ *Note:* Remaining members to\n┃      Face the Music...\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                        });
                    }
                    await new Promise(res => setTimeout(res, 1500)); 
                } catch (e) {
                    console.log(`Failed to remove: ${toRemove[i]}`);
                }
            }

            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *PURGE COMPLETE* ✿ ━━━━━┓\n┃\n┃ ✅ *Total Purged:* ${removedCount}\n┃ 🔄 *Status:* Group Cleared.\n┃\n┃ _Vinnie Hub Protocol Finished._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        })(); 
    }
};
