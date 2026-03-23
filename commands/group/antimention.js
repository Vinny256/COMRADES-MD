import fs from 'fs-extra';

const settingsFile = './settings.json';

const antimentionCommand = {
    name: 'antimention',
    category: 'group',
    desc: 'Kick users who mention the group in status',
    async execute(sock, msg, args, { from, isGroup, isAdmins, settings, prefix }) {
        // --- 🛡️ GROUP-ONLY SHIELD ---
        if (!isGroup) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ɢʀᴏᴜᴘ_ᴏɴʟʏ ᴘʀᴏᴛᴇᴄᴛɪᴏɴ.\n└────────────────────────┈` 
            });
        }

        // --- 📊 PERMISSION CHECKS ---
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = admins.includes(botId);

        if (!isAdmins) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ sᴇᴄᴜʀɪᴛʏ 』\n│ ⚙ *ᴀʟᴇʀᴛ:* ᴀᴅᴍɪɴ ᴘʀɪᴠɪʟᴇɢᴇ ʀᴇǫᴜɪʀᴇᴅ.\n└────────────────────────┈` 
            });
        }

        const action = args[0]?.toLowerCase();

        // --- 🚀 ACTION: ON ---
        if (action === 'on') {
            if (!isBotAdmin) {
                return sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴇʀʀᴏʀ:* ʙᴏᴛ ɴᴇᴇᴅs ᴀᴅᴍɪɴ sᴛᴀᴛᴜs.\n└────────────────────────┈` 
                });
            }

            settings.antimention = true;
            fs.writeJsonSync(settingsFile, settings);

            let onMsg = `┌────────────────────────┈\n`;
            onMsg += `│      *ᴀɴᴛɪ_ᴍᴇɴᴛɪᴏɴ_ᴀᴄᴛɪᴠᴇ* \n`;
            onMsg += `└────────────────────────┈\n\n`;
            onMsg += `┌─『 ᴘʀᴏᴛᴇᴄᴛɪᴏɴ_ʟᴏɢ 』\n`;
            onMsg += `│ 🛡️ *sᴛᴀᴛᴜs:* ᴇɴᴀʙʟᴇᴅ\n`;
            onMsg += `│ ⚙ *ᴍᴏᴅᴇ:* ʟᴇssᴏɴ_ᴛᴇᴀᴄʜɪɴɢ\n`;
            onMsg += `│ ⚠️ sᴛᴀᴛᴜs ᴍᴇɴᴛɪᴏɴs = ᴋɪᴄᴋ\n`;
            onMsg += `└────────────────────────┈\n\n`;
            onMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: onMsg });

        // --- 🚀 ACTION: OFF ---
        } else if (action === 'off') {
            settings.antimention = false;
            fs.writeJsonSync(settingsFile, settings);

            let offMsg = `┌────────────────────────┈\n`;
            offMsg += `│      *ᴀɴᴛɪ_ᴍᴇɴᴛɪᴏɴ_ɪɴᴀᴄᴛɪᴠᴇ* \n`;
            offMsg += `└────────────────────────┈\n\n`;
            offMsg += `┌─『 sʏsᴛᴇᴍ_ᴜᴘᴅᴀᴛᴇ 』\n`;
            offMsg += `│ 🔓 *sᴛᴀᴛᴜs:* ᴅɪsᴀʙʟᴇᴅ\n`;
            offMsg += `│ ⚙ *ʟᴏɢ:* ᴀᴜᴛᴏ-ᴋɪᴄᴋ ᴄᴇᴀsᴇᴅ.\n`;
            offMsg += `└────────────────────────┈\n\n`;
            offMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: offMsg });

        } else {
            // --- 📑 USAGE UI ---
            let usageMsg = `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n`;
            usageMsg += `│ ⚙ ${prefix}ᴀɴᴛɪᴍᴇɴᴛɪᴏɴ ᴏɴ\n`;
            usageMsg += `│ ⚙ ${prefix}ᴀɴᴛɪᴍᴇɴᴛɪᴏɴ ᴏғғ\n`;
            usageMsg += `└────────────────────────┈`;
            await sock.sendMessage(from, { text: usageMsg });
        }
    }
};

export default antimentionCommand;
