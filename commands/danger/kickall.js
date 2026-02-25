module.exports = {
    name: "kickall",
    category: "danger",
    desc: "V_HUB PROTOCOL: Total Group Purge",
    async execute(sock, msg, args, { from, isMe, prefix }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // 1. OWNER ONLY
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "⚠️", key: msg.key } });
            return sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *V_HUB SECURITY* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Protocol:* Restricted (Nuclear)\n┃ 👤 *User:* @${sender.split('@')[0]}\n┃ ⚠️ *Note:* You do not have the \n┃      clearance for this protocol.\n┃\n┃ _Integrity Shield Active._\n┗━━━━━━━━━━━━━━━━━━━━━━┛`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // 2. FETCH DATA & CACHE
        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];
        
        // 3. IMPROVED ADMIN CHECK (MIRRORING YOUR WORKING CODE)
        // Find the bot's ID in the group list (handles LID vs JID)
        const botNumber = sock.user.id.split(':')[0].split('@')[0];
        const botEntry = participants.find(p => (p.id || "").includes(botNumber) || (p.pn || "").includes(botNumber));
        
        const botIsAdmin = botEntry && !!botEntry.admin;
        
        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { 
                text: "✿ *V_HUB ERROR* ✿\n\nBot is not an admin. I cannot execute a purge without Admin privileges." 
            });
        }

        // 4. FILTERING (PROTECT BOT & OWNER)
        const toRemove = participants
            .map(p => p.id)
            .filter(id => id !== botEntry.id && id !== sender);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, { text: "✿ *V_HUB INFO* ✿\n\nNo targets found." });
        }

        // 5. THE NUCLEAR MESSAGE
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });
        await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ *VINNIE HUB* ✿ ━━━━━┓\n┃\n┃ ☢️ *PROTOCOL:* Nuclear Purge\n┃ 👥 *Targets:* ${toRemove.length}\n┃ ⚡ *Status:* background_exec\n┃\n┃ _Bot remains active for others._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        // 6. BACKGROUND PURGE (NON-BLOCKING)
        (async () => {
            let removedCount = 0;
            for (let jid of toRemove) {
                try {
                    // CRITICAL FIX: We use the ID directly from the metadata list
                    // This ensures we use the LID if the user is a LID user
                    await sock.groupParticipantsUpdate(from, [jid], "remove");
                    removedCount++;
                    
                    if (removedCount % 20 === 0) {
                        await sock.sendMessage(from, { 
                            text: `┏━━━━━ ✿ *PURGE UPDATE* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Removed:* ${removedCount}\n┃ ⏳ *Remaining:* ${toRemove.length - removedCount}\n┃ ⚡ *Note:* Face the Music...\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                        });
                    }
                    await new Promise(res => setTimeout(res, 2000)); 
                } catch (e) {
                    console.log(`Failed to remove ${jid}:`, e.message);
                }
            }

            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *PURGE COMPLETE* ✿ ━━━━━┓\n┃\n┃ ✅ *Total Purged:* ${removedCount}\n┃ 🔄 *Status:* Group Cleared.\n┃\n┃ _Vinnie Hub Protocol Finished._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        })(); 
    }
};
