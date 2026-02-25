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

        // --- 2. SMART ADMIN CHECK (ID FIXED) ---
        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];
        
        // Clean the Bot ID to match the group participant format
        const botId = sock.user.id.includes(':') 
            ? sock.user.id.split(':')[0] + '@s.whatsapp.net' 
            : sock.user.id.split('@')[0] + '@s.whatsapp.net';
            
        const botEntry = participants.find(p => p.id === botId);
        const botIsAdmin = botEntry && (botEntry.admin === 'admin' || botEntry.admin === 'superadmin');
        
        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { 
                text: "✿ *V_HUB ERROR* ✿\n\nCommand aborted. I need **Admin Rights** to execute this protocol." 
            });
        }

        // --- 3. TARGET FILTERING ---
        // Filters out the Bot and the Sender (Owner)
        const toRemove = participants
            .map(p => p.id)
            .filter(id => id !== botId && id !== sender);

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
                    
                    // EVERY 20 MEMBERS: Send a status update
                    if (removedCount % 20 === 0) {
                        await sock.sendMessage(from, { 
                            text: `┏━━━━━ ✿ *PURGE UPDATE* ✿ ━━━━━┓\n┃\n┃ 🛡️ *Removed:* ${removedCount}\n┃ ⏳ *Remaining:* ${totalToClear - removedCount}\n┃ ⚡ *Note:* Remaining members to\n┃      Face the Music...\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
                        });
                    }

                    // 1.5s delay to prevent WhatsApp from flagging the account
                    await new Promise(res => setTimeout(res, 1500)); 
                } catch (e) {
                    console.log(`Failed to remove: ${toRemove[i]}`);
                }
            }

            // FINAL REPORT
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ *PURGE COMPLETE* ✿ ━━━━━┓\n┃\n┃ ✅ *Total Purged:* ${removedCount}\n┃ 🔄 *Status:* Group Cleared.\n┃\n┃ _Vinnie Hub Protocol Finished._\n┗━━━━━━━━━━━━━━━━━━━━━━┛` 
            });
        })(); 

        // This allows the command execution to "finish" instantly while the loop continues
    }
};
