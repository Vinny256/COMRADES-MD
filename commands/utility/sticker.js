const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: "sticker",
    category: "utility",
    desc: "Create premium rounded stickers",
    async execute(sock, msg, args, { from }) {
        try {
            // 1. EXTRACT MEDIA OBJECT (Improved detection)
            const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;
            const mime = Object.keys(quoted)[0];
            
            // Check if it's actually an image or video
            const isMedia = mime === 'imageMessage' || mime === 'videoMessage' || 
                            (mime === 'viewOnceMessageV2' && (quoted.viewOnceMessageV2.message.imageMessage || quoted.viewOnceMessageV2.message.videoMessage));

            if (!isMedia) return sock.sendMessage(from, { text: "┃ ❌ Error: Reply to an Image or Video" });

            // Normalize the message object for downloading
            const mediaObj = quoted.viewOnceMessageV2 ? (quoted.viewOnceMessageV2.message.imageMessage || quoted.viewOnceMessageV2.message.videoMessage) : quoted[mime];

            // Phase 1: Requesting
            const { key } = await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ V_HUB_LAB ✿ ━━━━━┓\n┃\n┃  TYPE: STICKER_GEN\n┃  STAT: [ RENDERING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
            });

            // 2. DOWNLOAD MEDIA
            const stream = await downloadContentFromMessage(
                mediaObj, 
                mime.includes('image') ? 'image' : 'video'
            );
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 3. GENERATE STICKER
            const sticker = new Sticker(buffer, {
                pack: 'Vinnie Digital Hub', 
                author: 'Infinite Impact',   
                type: StickerTypes.ROUNDED, 
                categories: ['🤩', '✨'],
                quality: 70
            });

            const stickerBuffer = await sticker.toBuffer();

            // 4. DELIVERY
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            
            // Cleanup the status message
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error("Sticker Error:", e);
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ ERROR_LOG ✿ ━━━━━┓\n┃\n┃  STAT: FAILED\n┃  ERR: ${e.message.includes('ffmpeg') ? 'MISSING_FFMPEG' : 'RENDER_ERR'}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`
            });
        }
    }
};