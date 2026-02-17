const { Sticker, StickerTypes } = require('wa-sticker-formatter');

module.exports = {
    name: "sticker",
    category: "utility",
    desc: "Create premium rounded stickers",
    async execute(sock, msg, args, { from }) {
        // Find if user replied to an image/video or sent one
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage || 
                       msg.message.imageMessage || 
                       msg.message.videoMessage;
        
        if (!quoted) return sock.sendMessage(from, { text: "┃ ❌ Error: Reply to Image/Video" });

        // Phase 1: Requesting (Narrow Premium Frame)
        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ V_HUB_LAB ✿ ━━━━━┓\n┃\n┃  TYPE: STICKER_GEN\n┃  STAT: [ RENDERING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
        });

        try {
            // Download Media
            const stream = await sock.downloadContentFromMessage(
                quoted.imageMessage || quoted.videoMessage || quoted, 
                quoted.imageMessage ? 'image' : 'video'
            );
            
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Phase 2: Rounded Corner Processing
            const sticker = new Sticker(buffer, {
                pack: 'Vinnie Digital Hub', 
                author: 'Infinite Impact',   
                type: StickerTypes.ROUNDED,  // Radius Corner Logic
                categories: ['🤩', '✨'],
                quality: 70
            });

            const stickerBuffer = await sticker.toBuffer();

            // Phase 3: Delivery
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ ERROR_LOG ✿ ━━━━━┓\n┃\n┃  STAT: FAILED\n┃  ERR: RENDER_FAILED\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`, 
                edit: key 
            });
        }
    }
};