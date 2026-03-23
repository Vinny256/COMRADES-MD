import QRCode from 'qrcode';

const qrCommand = {
    name: "qr",
    category: "general",
    desc: "Generate a high-quality QR Code",
    async execute(sock, msg, args, { from, prefix }) {
        const text = args.join(" ");
        if (!text) return sock.sendMessage(from, { 
            text: `┌─『 ᴇʀʀᴏʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* ${prefix}qr [ᴛᴇxᴛ/ʟɪɴᴋ]\n└────────────────────────┈` 
        });

        // Phase 1: Dynamic Status with Sleek Styling
        const { key } = await sock.sendMessage(from, { 
            text: `┌────────────────────────┈\n` +
                  `│      *ǫʀ_ᴇɴɢɪɴᴇ* \n` +
                  `└────────────────────────┈\n\n` +
                  `┌─『 ɢᴇɴᴇʀᴀᴛɪɴɢ 』\n` +
                  `│ ⚙ *ᴅᴀᴛᴀ:* ${text.slice(0, 15)}...\n` +
                  `│ ⚙ *sᴛᴀᴛᴜs:* [ ᴘʀᴏᴄᴇssɪɴɢ... ]\n` +
                  `└────────────────────────┈`
        });

        try {
            // Generate QR to Buffer
            const qrBuffer = await QRCode.toBuffer(text, {
                errorCorrectionLevel: 'H',
                margin: 2,
                scale: 10
            });

            // Phase 2: Success Caption in Single-Line Style
            let caption = `┌────────────────────────┈\n` +
                          `│      *ǫʀ_sᴜᴄᴄᴇss* \n` +
                          `└────────────────────────┈\n\n` +
                          `┌─『 ǫʀ ᴅᴇᴛᴀɪʟs 』\n` +
                          `│ ⚙ *sᴏᴜʀᴄᴇ:* ᴠ_ᴅɪɢɪᴛᴀʟ_ʜᴜʙ\n` +
                          `│ ⚙ *ᴅᴀᴛᴀ:* ${text}\n` +
                          `│ ⚙ *ǫᴜᴀʟɪᴛʏ:* ʜɪɢʜ_ʀᴇs ✦\n` +
                          `└────────────────────────┈\n\n` +
                          `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // Send Image & Delete Status
            await sock.sendMessage(from, { 
                image: qrBuffer, 
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┌─『 ᴇʀʀᴏʀ_ʟᴏɢ 』\n` +
                      `│ ⚙ *sᴛᴀᴛᴜs:* ғᴀɪʟᴇᴅ\n` +
                      `│ ⚙ *ʀᴇᴀsᴏɴ:* sʏsᴛᴇᴍ_ᴇʀʀ\n` +
                      `└────────────────────────┈`, 
                edit: key 
            });
        }
    }
};

export default qrCommand;
