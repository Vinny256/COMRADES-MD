module.exports = {
    name: 'repo',
    category: 'utility',
    desc: 'Fetch bot source code and owner info with interactive UI.',
    async execute(sock, msg, args, { from, isMe }) {
        const repoUri = "https://github.com/Vinny256/COMRADES-MD"; 
        const ownerNumber = "254768666068";
        
        // --- 🎨 V_HUB STYLING ---
        const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        const repoBody = [
            `┃  🚀 *COMRADES-MD CORE*`,
            `┃  *Version:* 4.0.0 (Grid Sync)`,
            `┃  *Deployment:* Heroku Cloud`,
            `┃`,
            `┃  *Status:* 🟢 STABLE`,
            `┃  *Engine:* Baileys / Node.js`,
            `┃`,
            `┃  _Select an action below to_`,
            `┃  _interact with the source._`
        ].join('\n');

        // --- ⚡ INTERACTIVE BUTTONS ---
        const templateButtons = [
            {
                index: 1,
                urlButton: {
                    displayText: '⭐ FORK REPOSITORY',
                    url: `${repoUri}/fork`
                }
            },
            {
                index: 2,
                urlButton: {
                    displayText: '👑 CHAT ARCHITECT',
                    url: `https://wa.me/${ownerNumber}?text=Hello+Vinnie+Architect`
                }
            },
            {
                index: 3,
                quickReplyButton: {
                    displayText: '🛰️ CHECK LATENCY',
                    id: '.ping'
                }
            }
        ];

        // --- 📤 SENDING WITH EXTERNAL AD REPLY ---
        await sock.sendMessage(from, { react: { text: "📦", key: msg.key } });

        await sock.sendMessage(from, {
            text: vStyle(repoBody),
            footer: 'COMRADES-MD • V_HUB UTILITY',
            templateButtons: templateButtons,
            contextInfo: {
                externalAdReply: {
                    title: "COMRADES-MD | OFFICIAL REPO",
                    body: "Designed for Speed, Shielded for Stability.",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    // Pulling directly from your GitHub profile for authenticity
                    thumbnailUrl: "https://avatars.githubusercontent.com/u/144422204?v=4", 
                    sourceUrl: repoUri
                }
            }
        }, { quoted: msg });
    }
};