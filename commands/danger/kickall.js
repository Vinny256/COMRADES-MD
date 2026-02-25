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

        // --- 2. RAW DIGIT ADMIN CHECK (FIXES THE "WHY") ---
        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];
        
        // Extract only the numbers from the bot's ID (e.g., 254768666068)
        const botNumber = sock.user.id.replace(/\D/g, ''); 

        // Find the participant entry where the ID contains the bot's numbers
        const botEntry = participants.find(p => p.id.includes(botNumber));
        
        // Check if that entry has admin rights
        const botIsAdmin = botEntry && (botEntry.admin === 'admin' || botEntry.admin === 'superadmin');

        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { 
                text: "✿ *V_HUB ERROR* ✿\n\nI cannot execute the purge. My number is not on the **Admin List** of this group metadata." 
            });
        }

        // --- 3. TARGET FILTERING ---
        // We use the botEntry.id (whatever format it is) to make sure the bot doesn't kick itself
        const toRemove = participants
            .map(p => p.id)
            .filter(id => id !== botEntry.id && id !== sender);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, { text: "✿ *V_HUB INFO* ✿\n\nNo external targets found." });
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
