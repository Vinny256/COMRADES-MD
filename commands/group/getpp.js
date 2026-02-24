module.exports = {
    name: 'getpp',
    category: 'group',
    desc: 'Extracts the group profile picture in high resolution',
    async execute(sock, msg, args, { from }) {
        // Use the current group or a JID provided in args
        const target = args[0] || from;

        if (!target.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "⚠️ Please use this in a group or provide a valid Group JID." });
        }

        await sock.sendMessage(from, { react: { text: "🖼️", key: msg.key } });

        try {
            // Fetch the high-res URL
            const ppUrl = await sock.profilePictureUrl(target, 'image');

            const caption = `┏━━━━━ ✿ *EXTRACTOR* ✿ ━━━━━┓\n┃\n┃ 📸 *Target:* Group Profile\n┃ 🛠️ *Quality:* High Definition\n┃ 📂 *Status:* Successfully Fetched\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

            await sock.sendMessage(from, { 
                image: { url: ppUrl }, 
                caption: caption 
            });

        } catch (e) {
            // If the group has no profile picture or privacy settings block it
            console.error("PP Extraction Error:", e);
            sock.sendMessage(from, { 
                text: "┏━━━━━ ✿ *NOTICE* ✿ ━━━━━┓\n┃\n┃ ❌ *Failed to Extract Profile Picture.*\n┃ 💡 *Reason:* No image set or \n┃    privacy restrictions.\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛" 
            });
        }
    }
};