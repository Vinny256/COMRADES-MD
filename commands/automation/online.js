const onlineCommand = {
    name: "online",
    category: "automation",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        // 🔒 OWNER LOCK & STYLED FALLBACK
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            return await sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴜɴᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴀᴄᴄᴇss\n│ ⚙ *sᴛᴀᴛᴜs:* ғᴏᴜɴᴅᴇʀ ᴏɴʟʏ\n└────────────────────────┈` 
            }, { quoted: msg });
        }

        const mode = args[0]?.toLowerCase();

        try {
            if (mode === 'on') {
                // TIER 1: FULL VISIBILITY
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('available');
                
                await sock.sendMessage(from, { react: { text: "🟢", key: msg.key } });
                await sock.sendMessage(from, { 
                    text: `┌────────────────────────┈\n` +
                          `│      *sʏsᴛᴇᴍ_ᴜᴘᴅᴀᴛᴇ* \n` +
                          `└────────────────────────┈\n\n` +
                          `┌─『 sᴛᴀᴛᴜs ᴀᴄᴛɪᴠᴇ 』\n` +
                          `│ ⚙ *sᴛᴀᴛᴜs:* ᴏɴʟɪɴᴇ & ᴠɪsɪʙʟᴇ\n` +
                          `│ ⚙ *ᴍᴏᴅᴇ:* sᴛᴀɴᴅᴀʀᴅ ✦\n` +
                          `└────────────────────────┈\n\n` +
                          `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_` 
                }, { quoted: msg });
            } 

            else if (mode === 'freeze') {
                // TIER 2: OFFICIAL GHOST
                await sock.updateLastSeenPrivacy('none');
                await sock.updateOnlinePrivacy('match_last_seen');
                await sock.sendPresenceUpdate('unavailable');

                await sock.sendMessage(from, { react: { text: "❄️", key: msg.key } });
                await sock.sendMessage(from, { 
                    text: `┌────────────────────────┈\n` +
                          `│      *sʏsᴛᴇᴍ_ᴜᴘᴅᴀᴛᴇ* \n` +
                          `└────────────────────────┈\n\n` +
                          `┌─『 ғʀᴏᴢᴇɴ_ɢʜᴏsᴛ 』\n` +
                          `│ ❄️ *sᴛᴀᴛᴜs:* ʟᴀsᴛ sᴇᴇɴ ғʀᴏᴢᴇɴ\n` +
                          `│ 🛡️ *sᴀғᴇᴛʏ:* 𝟷𝟶𝟶% sᴇᴄᴜʀᴇ\n` +
                          `│ ⚙ *ɴᴏᴛᴇ:* ʀᴇᴄɪᴘʀᴏᴄɪᴛʏ ᴅɪsᴀʙʟᴇᴅ\n` +
                          `└────────────────────────┈` 
                }, { quoted: msg });
            }

            else if (mode === 'godpro') {
                // TIER 3: GOD PRO
                if (args[1] !== 'accept') {
                    return await sock.sendMessage(from, { 
                        text: `┌────────────────────────┈\n` +
                              `│      *ᴇxᴛʀᴇᴍᴇ_ᴀʟᴇʀᴛ* \n` +
                              `└────────────────────────┈\n\n` +
                              `┌─『 ɢᴏᴅ ᴘʀᴏ ᴍᴏᴅᴇ 』\n` +
                              `│ ⚠️ *ᴡᴀʀɴɪɴɢ:* ᴏɴᴇ-ᴡᴀʏ ᴍɪʀʀᴏʀ\n` +
                              `│ 👁️ *ᴠɪsɪᴏɴ:* ʏᴏᴜ sᴇᴇ ᴛʜᴇᴍ\n` +
                              `│ ❄️ *ᴛɪᴍᴇ:* sᴛᴀɢɴᴀɴᴛ/ᴏʟᴅ\n` +
                              `│ 🛡️ *sɪɢɴᴀʟs:* ᴛʏᴘɪɴɢ/ʀᴇᴀᴅ ᴏғғ\n` +
                              `└────────────────────────┈\n\n` +
                              `◈ *ᴀᴄᴛɪᴠᴀᴛᴇ:* ${prefix}ᴏɴʟɪɴᴇ ɢᴏᴅᴘʀᴏ ᴀᴄᴄᴇᴘᴛ` 
                    }, { quoted: msg });
                }
                
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('unavailable');
                
                await sock.sendMessage(from, { react: { text: "🌀", key: msg.key } });
                await sock.sendMessage(from, { 
                    text: `┌─『 ɢᴏᴅ ᴘʀᴏ: ᴀᴄᴛɪᴠᴇ 』\n` +
                          `│ 👁️ *sᴛᴀᴛᴜs:* ᴏɴᴇ-ᴡᴀʏ ᴍɪʀʀᴏʀ ᴏɴ\n` +
                          `│ 🔇 *sᴛᴇᴀʟᴛʜ:* ᴛʏᴘɪɴɢ ʙʟᴏᴄᴋᴇᴅ\n` +
                          `│ ❄️ *ᴛɪᴍᴇ:* ғʀᴏᴢᴇɴ ᴀᴛ ɴᴏᴡ\n` +
                          `└────────────────────────┈` 
                }, { quoted: msg });
            }

            else if (mode === 'off') {
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('available');
                await sock.sendMessage(from, { text: "┌─『 sʏsᴛᴇᴍ 』\n│ 🔄 sᴛᴇᴀʟᴛʜ ᴅɪsᴀʙʟᴇᴅ.\n└────────────────────────┈" }, { quoted: msg });
            }

            else {
                // ELITE STEALTH MENU
                let menu = `┌────────────────────────┈\n`;
                menu += `│      *sᴛᴇᴀʟᴛʜ_ʜᴜʙ* \n`;
                menu += `└────────────────────────┈\n\n`;
                
                menu += `┌─『 ᴄᴏɴғɪɢᴜʀᴀᴛɪᴏɴ 』\n`;
                menu += `│ ├─◈ ${prefix}ᴏɴʟɪɴᴇ ᴏɴ\n`;
                menu += `│ │   └─ sᴛᴀɴᴅᴀʀᴅ ᴠɪsɪʙɪʟɪᴛʏ\n`;
                menu += `│ ├─◈ ${prefix}ᴏɴʟɪɴᴇ ғʀᴇᴇᴢᴇ\n`;
                menu += `│ │   └─ sᴀғᴇ ғʀᴏᴢᴇɴ ɢʜᴏsᴛ\n`;
                menu += `│ ├─◈ ${prefix}ᴏɴʟɪɴᴇ ɢᴏᴅᴘʀᴏ\n`;
                menu += `│ │   └─ ᴍɪʀʀᴏʀ (ᴇxᴘᴇʀɪᴍᴇɴᴛᴀʟ)\n`;
                menu += `│ ╰─◈ ${prefix}ᴏɴʟɪɴᴇ ᴏғғ\n`;
                menu += `│     └─ ʀᴇsᴇᴛ ᴛᴏ ᴅᴇғᴀᴜʟᴛ\n`;
                menu += `└────────────────────────┈\n\n`;
                
                menu += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;
                
                await sock.sendMessage(from, { text: menu }, { quoted: msg });
            }

        } catch (e) {
            await sock.sendMessage(from, { text: `┌─『 ᴇʀʀᴏʀ 』\n│ ⚙ ${e.message}\n└────────────────────────┈` }, { quoted: msg });
        }
    }
};

export default onlineCommand;
