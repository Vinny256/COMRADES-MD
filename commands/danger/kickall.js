module.exports = {
    name: "kickall",
    category: "danger",
    desc: "V_HUB PROTOCOL: Total Group Purge",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // 1. OWNER CHECK
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "⚠️", key: msg.key } });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *V_HUB SECURITY* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Protocol:* Restricted (Nuclear)\n┃ 👤 *User:* @${sender.split('@')[0]}\n┃ ⚠️ *Note:* You do not have the \n┃      clearance for this protocol.\n┃\n┃ _Integrity Shield Active._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // 2. IDENTITY MIRROR ADMIN CHECK
        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];
        
        // FIND THE BOT: We check for 'fromMe' in the metadata or match the number
        const botNumber = sock.user.id.split(':')[0].split('@')[0];
        const botInList = participants.find(p => p.id.includes(botNumber));

        // CHECK ADMIN STATUS OF THE FOUND IDENTITY
        if (!botInList || !botInList.admin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { 
                text: "✿ *V_HUB ERROR* ✿\n\nI am not recognized as an Admin in this group's Registry. Please re-promote me." 
            });
        }

        // 3. TARGET FILTERING
        // Use the EXACT ID found in the group list for the bot
        const botGroupJid = botInList.id; 
        const toRemove = participants
            .map(p => p.id)
            .filter(id => id !== botGroupJid && id !== sender);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, { text: "✿ *V_HUB INFO* ✿\n\nNo external targets found." });
        }

        // 4. INITIATION
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ ☢️ *PROTOCOL:* Nuclear Purge\n┃ 👥 *Targets:* ${toRemove.length}\n┃ ⚡ *Status:* background_exec\n┃\n┃ _Bot remains active for others._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        // 5. BACKGROUND EXECUTION
        (async () => {
            let removedCount = 0;
            for (let i = 0; i < toRemove.length; i++) {
                try {
                    // CRITICAL: We pass an array of IDs
                    await sock.groupParticipantsUpdate(from, [toRemove[i]], "remove");
                    removedCount++;
                    
                    if (removedCount % 20 === 0) {
                        await sock.sendMessage(from, { 
                            text: `┏━━━━━ ✿ *PURGE UPDATE* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Removed:* ${removedCount}\n┃ ⏳ *Remaining:* ${toRemove.length - removedCount}\n┃ ⚡ *Note:* Remaining members to\n┃      Face the Music...\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                        });
                    }
                    await new Promise(res => setTimeout(res, 2000)); // Slightly slower for stability
                } catch (e) {
                    console.log(`Failed to remove ${toRemove[i]}:`, e);
                }
            }

            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *PURGE COMPLETE* ✿ ━━━━━┓\n┃\n┃ ✅ *Total Purged:* ${removedCount}\n┃ 🔄 *Status:* Group Cleared.\n┃\n┃ _Vinnie Hub Protocol Finished._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        })(); 
    }
};
