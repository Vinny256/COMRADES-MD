import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const statusSaveCommand = {
    name: 'save',
    alias: ['send', 's'],
    category: 'utility',
    desc: 'Capture and download WhatsApp Status media',
    async execute(sock, m, args, { from, prefix }) {
        
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "📥", key: m.key } });

        // 1. Get the Quoted Message metadata
        const quotedInfo = m.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = quotedInfo?.quotedMessage;

        // --- 🛡️ VALIDATION: IS THIS A STATUS? ---
        if (!quotedMsg || quotedInfo.remoteJid !== 'status@broadcast') {
            return await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ 』\n│ ❌ *ɪɴᴠᴀʟɪᴅ_ᴛᴀʀɢᴇᴛ*\n│ ⚙ ʟᴏɢ: ʀᴇᴘʟʏ_ᴛᴏ_ᴀ_sᴛᴀᴛᴜs\n└────────────────────────┈` 
            });
        }

        try {
            // 2. Identify Media Type
            const type = Object.keys(quotedMsg)[0];
            const media = quotedMsg[type];
            const mediaType = type.replace('Message', '');

            // --- 🚀 DOWNLOAD TO RAM (ZERO DISK FOOTPRINT) ---
            const stream = await downloadContentFromMessage(media, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // --- 📑 CAPTION UI CONSTRUCTION ---
            let saveLog = `┌────────────────────────┈\n`;
            saveLog += `│      *ᴠ-ʜᴜʙ_sᴛᴀᴛᴜs_ᴄᴀᴘᴛᴜʀᴇ* \n`;
            saveLog += `└────────────────────────┈\n\n`;
            
            saveLog += `┌─『 ᴍᴇᴅɪᴀ_ɪɴᴅᴇx 』\n`;
            saveLog += `│ ✅ *sᴛᴀᴛᴜs:* ᴄᴀᴘᴛᴜʀᴇᴅ\n`;
            saveLog += `│ 📂 *ᴛʏᴘᴇ:* ${mediaType.toUpperCase()}\n`;
            saveLog += `│ ⚙ *ʟᴏɢ:* ʀᴀᴍ_ʙᴜғғᴇʀ_sʏɴᴄ\n`;
            saveLog += `└────────────────────────┈\n\n`;
            
            saveLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // --- 📦 REFLECTION PROTOCOL ---
            if (type === 'imageMessage') {
                await sock.sendMessage(from, { image: buffer, caption: saveLog }, { quoted: m });
            } else if (type === 'videoMessage') {
                await sock.sendMessage(from, { video: buffer, caption: saveLog }, { quoted: m });
            } else if (type === 'audioMessage') {
                // For Status Voice Notes
                await sock.sendMessage(from, { 
                    audio: buffer, 
                    mimetype: 'audio/ogg; codecs=opus', 
                    ptt: true 
                }, { quoted: m });
            } else {
                await sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ᴜɴsᴜᴘᴘᴏʀᴛᴇᴅ_ᴛʏᴘᴇ*\n│ ⚙ ʟᴏɢ: ${type}\n└────────────────────────┈` 
                });
            }

            // 5. Manual Memory Flush
            buffer = null;

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ᴄᴀᴘᴛᴜʀᴇ_ғᴀɪʟᴇᴅ*\n│ ⚙ ʟᴏɢ: sᴛᴀᴛᴜs_ᴇxᴘɪʀᴇᴅ_ᴏʀ_ᴅᴇʟᴇᴛᴇᴅ\n└────────────────────────┈` 
            });
        }
    }
};

export default statusSaveCommand;
