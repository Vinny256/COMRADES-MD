import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const antiViewOnceCommand = {
    name: 'vv',
    alias: ['viewonce', 'retrive'],
    category: 'utility',
    desc: 'Bypass and retrieve ViewOnce media',
    async execute(sock, m, args, { from, prefix }) {
        
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "👁️", key: m.key } });

        // 1. Identify the Quoted Message
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quoted) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ 』\n│ ❌ *ɪɴᴠᴀʟɪᴅ_ᴛᴀʀɢᴇᴛ*\n│ ⚙ ʟᴏɢ: ʀᴇᴘʟʏ_ᴛᴏ_ᴀ_ᴠɪᴇᴡᴏɴᴄᴇ_ᴍsɢ\n└────────────────────────┈` 
            });
        }

        // 2. Deep Search for ViewOnce Content (V2 & Extension Handling)
        const viewOnce = quoted.viewOnceMessageV2 || quoted.viewOnceMessage || quoted.viewOnceMessageV2Extension;
        const actualMsg = viewOnce ? (viewOnce.message || viewOnce) : quoted;

        // 3. Identify Media Type
        const type = Object.keys(actualMsg)[0];
        const media = actualMsg[type];

        // --- 🛡️ VALIDATION: IS IT ACTUALLY VIEWONCE? ---
        if (!viewOnce && !media?.viewOnce) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ 』\n│ ⚠️ *ɴᴏᴛ_ᴠɪᴇᴡᴏɴᴄᴇ*\n│ ⚙ ʟᴏɢ: sᴛᴀɴᴅᴀʀᴅ_ᴍᴇᴅɪᴀ_ᴅᴇᴛᴇᴄᴛᴇᴅ\n└────────────────────────┈` 
            });
        }

        try {
            // --- 🚀 DOWNLOAD TO RAM (ZERO DISK FOOTPRINT) ---
            const mediaType = type.replace('Message', '');
            const stream = await downloadContentFromMessage(media, mediaType);
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // --- 📑 RETRIEVAL UI CONSTRUCTION ---
            let vvLog = `┌────────────────────────┈\n`;
            vvLog += `│      *ᴠ-ʜᴜʙ_ᴀɴᴛɪ-ᴠɪᴇᴡᴏɴᴄᴇ* \n`;
            vvLog += `└────────────────────────┈\n\n`;
            
            vvLog += `┌─『 ᴅᴀᴛᴀ_ʀᴇᴛʀɪᴇᴠᴀʟ 』\n`;
            vvLog += `│ ✅ *sᴛᴀᴛᴜs:* ʙʏᴘᴀssᴇᴅ\n`;
            vvLog += `│ 📂 *ᴛʏᴘᴇ:* ${mediaType.toUpperCase()}\n`;
            vvLog += `│ 🛡️ *sʜɪᴇʟᴅ:* ɴᴜᴄʟᴇᴀʀ_sɪʟᴇɴᴄᴇ\n`;
            vvLog += `└────────────────────────┈\n\n`;
            
            vvLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // --- 📦 REFLECTION PROTOCOL ---
            if (type === 'imageMessage') {
                await sock.sendMessage(from, { image: buffer, caption: vvLog }, { quoted: m });
            } else if (type === 'videoMessage') {
                await sock.sendMessage(from, { video: buffer, caption: vvLog }, { quoted: m });
            } else if (type === 'audioMessage') {
                await sock.sendMessage(from, { 
                    audio: buffer, 
                    mimetype: 'audio/ogg; codecs=opus', 
                    ptt: true 
                }, { quoted: m });
            }

            // 6. Manual Memory Flush
            buffer = null; 

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ʀᴇᴛʀɪᴇᴠᴀʟ_ғᴀɪʟᴇᴅ*\n│ ⚙ ʟᴏɢ: ᴍᴇᴅɪᴀ_ᴇxᴘɪʀᴇᴅ_ᴏʀ_ᴠᴏɪᴅ\n└────────────────────────┈` 
            });
        }
    }
};

export default antiViewOnceCommand;
