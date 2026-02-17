module.exports = {
    name: "pp",
    category: "utility",
    desc: "Extract HD Profile Picture",
    async execute(sock, msg, args, { from }) {
        // Identify target: tagged user, number in args, or the sender
        let target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : msg.key.participant || from);

        // Phase 1: Requesting State
        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ V_HUB_SYS ✿ ━━━━━┓\n┃\n┃  TYPE: PP_EXTRACTOR\n┃  STAT: [ SCANNING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
        });

        try {
            // Fetch the high-resolution URL
            const ppUrl = await sock.profilePictureUrl(target, 'image');

            // Phase 2: Success Caption
            let caption = `┏━━━━━ ✿ PP_RESULT ✿ ━━━━━┓\n`;
            caption += `┃\n`;
            caption += `┃  USER: @${target.split('@')[0]}\n`;
            caption += `┃  QUAL: HD_ORIGINAL\n`;
            caption += `┃  HUB: V_DIGITAL_HUB\n`;
            caption += `┃\n`;
            caption += `┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`;

            // Phase 3: Delivery
            await sock.sendMessage(from, { 
                image: { url: ppUrl }, 
                caption: caption,
                mentions: [target]
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            // Error handling for private/no profile pic
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ ERROR_LOG ✿ ━━━━━┓\n┃\n┃  STAT: FAILED\n┃  ERR: PRIVACY_RESTRICT\n┃  MSG: NO_IMAGE_FOUND\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`, 
                edit: key 
            });
        }
    }
};