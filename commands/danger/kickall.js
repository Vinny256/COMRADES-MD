const kickallCommand = {
    name: "kickall",
    category: "danger",
    desc: "V_HUB PROTOCOL: Total Group Purge",

    async execute(sock, msg, args, { from, isMe, prefix }) {
        const sender = msg.key.participant || msg.key.remoteJid;

        // 1️⃣ OWNER-ONLY ACCESS SHIELD
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            return sock.sendMessage(from, {
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴘʀᴏᴛᴏᴄᴏʟ:* ʀᴇsᴛʀɪᴄᴛᴇᴅ (ɴᴜᴄʟᴇᴀʀ)\n│ ⚙ *ᴜsᴇʀ:* @${sender.split('@')[0]}\n│ ⚙ *ᴀʟᴇʀᴛ:* ғᴏᴜɴᴅᴇʀ ᴘʀɪᴠɪʟᴇɢᴇ ʀᴇǫᴜɪʀᴇᴅ\n└────────────────────────┈`,
                mentions: [sender]
            }, { quoted: msg });
        }

        // 2️⃣ GROUP CHECK
        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ʀᴇǫᴜɪʀᴇs ɢʀᴏᴜᴘ ᴇɴᴠɪʀᴏɴᴍᴇɴᴛ.\n└────────────────────────┈` 
            });
        }

        // 3️⃣ FETCH DATA
        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];

        // 4️⃣ BOT ADMIN CHECK
        const botNumber = sock.user.id.replace(/\D/g, ''); 
        const botEntry = participants.find(p => (p.id || "").includes(botNumber));
        const botIsAdmin = botEntry && (botEntry.admin === 'admin' || botEntry.admin === 'superadmin');

        if (!botIsAdmin) {
            await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ ᴇʀʀᴏʀ 』\n│ ⚙ ɪ ᴀᴍ ɴᴏᴛ ᴀɴ *ᴀᴅᴍɪɴ* ʜᴇʀᴇ.\n└────────────────────────┈` 
            });
        }

        // 5️⃣ FILTER TARGETS (Protects Bot, Owner, and Admins)
        const toRemove = participants
            .filter(p => 
                p.id !== botEntry.id && 
                p.id !== sender && 
                !p.admin 
            )
            .map(p => p.id);

        if (toRemove.length === 0) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ ɪɴғᴏ 』\n│ ⚙ ɴᴏ ʀᴇᴍᴏᴠᴀʙʟᴇ ᴛᴀʀɢᴇᴛs ғᴏᴜɴᴅ.\n│ ⚙ ᴀᴅᴍɪɴs & ᴏᴡɴᴇʀ ᴘʀᴏᴛᴇᴄᴛᴇᴅ.\n└────────────────────────┈` 
            });
        }

        // 6️⃣ INITIATION
        await sock.sendMessage(from, { react: { text: "☢️", key: msg.key } });
        await sock.sendMessage(from, {
            text: `┌────────────────────────┈\n` +
                  `│      *ɴᴜᴄʟᴇᴀʀ_ᴘᴜʀɢᴇ* \n` +
                  `└────────────────────────┈\n\n` +
                  `┌─『 ᴇxᴇᴄᴜᴛɪᴏɴ_ʟᴏɢ 』\n` +
                  `│ ⚙ *ᴘʀᴏᴛᴏᴄᴏʟ:* ᴀᴄᴛɪᴠᴇ\n` +
                  `│ ⚙ *ᴛᴀʀɢᴇᴛs:* ${toRemove.length}\n` +
                  `│ ⚙ *sᴛᴀᴛᴜs:* ʙᴀᴄᴋɢʀᴏᴜɴᴅ_ᴇxᴇᴄ\n` +
                  `└────────────────────────┈\n\n` +
                  `_ᴡᴀʀɴɪɴɢ: ᴛʜɪs ᴀᴄᴛɪᴏɴ ɪs ғɪɴᴀʟ._`
        });

        // 7️⃣ BACKGROUND EXECUTION
        (async () => {
            let removedCount = 0;
            for (let jid of toRemove) {
                try {
                    await sock.groupParticipantsUpdate(from, [jid], "remove");
                    removedCount++;

                    if (removedCount % 20 === 0) {
                        await sock.sendMessage(from, {
                            text: `┌─『 ᴘᴜʀɢᴇ ᴜᴘᴅᴀᴛᴇ 』\n│ ⚙ *ʀᴇᴍᴏᴠᴇᴅ:* ${removedCount}\n│ ⚙ *ʀᴇᴍᴀɪɴɪɴɢ:* ${toRemove.length - removedCount}\n└────────────────────────┈`
                        });
                    }
                    // Safety delay (2.5s) to avoid bans
                    await new Promise(res => setTimeout(res, 2500)); 
                } catch (e) {
                    console.log(`[V_HUB] Failed to remove ${jid}:`, e.message);
                }
            }

            // FINAL REPORT
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
            await sock.sendMessage(from, {
                text: `┌─『 ᴘᴜʀɢᴇ ᴄᴏᴍᴘʟᴇᴛᴇ 』\n│ ⚙ *ᴛᴏᴛᴀʟ ᴘᴜʀɢᴇᴅ:* ${removedCount}\n│ ⚙ *sᴛᴀᴛᴜs:* sᴛᴀʙɪʟɪᴢᴇᴅ\n└────────────────────────┈\n\n` +
                      `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`
            });
        })(); 
    }
};

export default kickallCommand;
