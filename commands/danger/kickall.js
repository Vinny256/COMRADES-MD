module.exports = {
    name: "kickall",
    category: "danger",
    desc: "V_HUB PROTOCOL: Total Group Purge",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // --- 1. ACCESS DENIED STYLING ---
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "⚠️", key: msg.key } });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *V_HUB SECURITY* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Protocol:* Restricted (Nuclear)\n┃ 👤 *User:* @${sender.split('@')[0]}\n┃ ⚠️ *Note:* You do not have the \n┃      clearance for this protocol.\n┃\n┃ _Integrity Shield Active._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // --- 2. THE WORKING ADMIN LOGIC ---
        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];
        
        // Use the exact same admin mapping as your working group command
        const admins = participants.filter(p => p.admin).map(p => p.id);
        
        // Get the bot's number without suffixes (e.g., 254xxx)
        const botNumber = sock.user.id.split(':')[0].split('@')[0];
        
        // BRUTE FORCE CHECK: See if ANY admin ID contains the bot's number
        const botIsAdmin = admins.some(adminId => adminId.includes(botNumber));
        
        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { 
                text: "✿ *V_HUB ERROR* ✿\n\nCommand aborted. I need **Admin Rights** to execute this protocol." 
            });
        }

        // --- 3. TARGET FILTERING ---
        // Find the bot's full ID from the participant list to avoid kicking itself
        const botFullId = participants.find(p => p.id.includes(botNumber))?.id;
        
        const toRemove = participants
            .map(p => p.id)
            .filter(id => id !== botFullId && id !== sender);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, { text: "✿ *V_HUB INFO* ✿\n\nNo external targets found." });
        }

        // --- 4. INITIATION ---
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });
        
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ ☢️ *PROTOCOL:* Nuclear Purge\n┃ 👥 *Targets:* ${toRemove.length}\n┃ ⚡ *Status:* background_exec\n┃\n┃ _Bot remains active for others._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        // --- 5. BACKGROUND EXECUTION (NON-BLOCKING) ---
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
