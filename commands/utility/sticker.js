import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const stickerCommand = {
    name: "sticker",
    alias: ['s', 'stiker'],
    category: "utility",
    desc: "Create premium rounded stickers from images/videos",
    async execute(sock, msg, args, { from, prefix }) {
        try {
            // --- 🎯 1. TARGET DETECTION (IMAGE/VIDEO/VIEW-ONCE) ---
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
            if (!quoted) return;

            const mime = Object.keys(quoted)[0];
            const isViewOnce = mime === 'viewOnceMessageV2';
            const actualQuoted = isViewOnce ? quoted.viewOnceMessageV2.message : quoted;
            const actualMime = Object.keys(actualQuoted)[0];

            // Media Validation
            const isMedia = actualMime === 'imageMessage' || actualMime === 'videoMessage';

            if (!isMedia) {
                return sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ 』\n│ ❌ *ɪɴᴠᴀʟɪᴅ_ᴍᴇᴅɪᴀ*\n│ ⚙ ʟᴏɢ: ʀᴇᴘʟʏ_ᴛᴏ_ɪᴍᴀɢᴇ_ᴏʀ_ᴠɪᴅᴇᴏ\n└────────────────────────┈` 
                });
            }

            const mediaObj = actualQuoted[actualMime];

            // --- ✦ INITIAL REACTION & SCANNING ---
            const { key } = await sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ_ʟᴀʙ 』\n│ 🧪 *ᴛʏᴘᴇ:* sᴛɪᴄᴋᴇʀ_ɢᴇɴ\n│ ⚙ *sᴛᴀᴛ:* [ ʀᴇɴᴅᴇʀɪɴɢ... ]\n└────────────────────────┈` 
            });

            // --- 🚀 2. DOWNLOAD TO RAM ---
            const stream = await downloadContentFromMessage(
                mediaObj, 
                actualMime.includes('image') ? 'image' : 'video'
            );
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // --- 🎨 3. GENERATE PREMIUM STICKER ---
            const sticker = new Sticker(buffer, {
                pack: 'Vinnie Digital Hub', 
                author: 'Infinite Impact',   
                type: StickerTypes.ROUNDED, 
                categories: ['🤩', '✨'],
                quality: 70
            });

            const stickerBuffer = await sticker.toBuffer();

            // --- 📦 4. DELIVERY ---
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            
            // Cleanup the scanning message
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error("Sticker Error:", e);
            const errType = e.message.includes('ffmpeg') ? 'ᴍɪssɪɴɢ_ғғᴍᴘᴇɢ' : 'ʀᴇɴᴅᴇʀ_ᴇʀʀ';
            
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ғᴀɪʟᴜʀᴇ 』\n│ ❌ *sᴛᴀᴛ:* ғᴀɪʟᴇᴅ\n│ ⚙ *ᴇʀʀ:* ${errType}\n│ 💡 *ᴍsɢ:* ᴄʜᴇᴄᴋ_ᴍᴇᴅɪᴀ_ʟᴇɴɢᴛʜ\n└────────────────────────┈` 
            });
        }
    }
};

export default stickerCommand;
