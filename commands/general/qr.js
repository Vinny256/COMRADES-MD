const QRCode = require('qrcode');

module.exports = {
    name: "qr",
    category: "general",
    desc: "Generate a high-quality QR Code",
    async execute(sock, msg, args, { from, prefix }) {
        const text = args.join(" ");
        if (!text) return sock.sendMessage(from, { text: "┃ ❌ Usage: .qr [text/link]" });

        // Phase 1: Dynamic Status with Full Styling
        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━━ ✿ QR_ENGINE ✿ ━━━━━━┓\n┃\n┃  DATA: ${text.slice(0, 15)}...\n┃  STATUS: [ GENERATING... ]\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛` 
        });

        try {
            // Generate QR to Buffer
            const qrBuffer = await QRCode.toBuffer(text, {
                errorCorrectionLevel: 'H',
                margin: 2,
                scale: 10
            });

            // Phase 2: Success Caption
            let caption = `┏━━━━━━ ✿ QR_SUCCESS ✿ ━━━━━━┓\n`;
            caption += `┃\n`;
            caption += `┃  SOURCE: V_DIGITAL_HUB\n`;
            caption += `┃  DATA: ${text}\n`;
            caption += `┃  QUALITY: HIGH_RES\n`;
            caption += `┃\n`;
            caption += `┗━━━━━ ✿ INFINITE_IMPACT ✿ ━━━━━┛`;

            // Send Image & Delete Status
            await sock.sendMessage(from, { 
                image: qrBuffer, 
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┏━━━━━━ ✿ ERROR_LOG ✿ ━━━━━━┓\n┃\n┃  STATUS: FAILED\n┃  REASON: SYSTEM_ERR\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`, 
                edit: key 
            });
        }
    }
};