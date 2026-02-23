module.exports = {
    name: 'repo',
    category: 'utility',
    desc: 'Fetch bot source code with high-compatibility buttons.',
    async execute(sock, msg, args, { from, isMe }) {
        const repoUri = "https://github.com/Vinny256/COMRADES-MD"; 
        const ownerNumber = "254768666068";
        
        const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        const repoBody = [
            `🚀 *COMRADES-MD CORE*`,
            `*Version:* 4.0.0 (Grid Sync)`,
            `*Status:* 🟢 STABLE`,
            `*Engine:* Baileys / Node.js`,
            `\nSelect an action below:`
        ].join('\n');

        // --- 🔘 INTERACTIVE BUTTON STRUCTURE ---
        const buttons = [
            { buttonId: 'repo_fork', buttonText: { displayText: '⭐ FORK REPO' }, type: 1 },
            { buttonId: 'repo_owner', buttonText: { displayText: '👑 ARCHITECT' }, type: 1 },
            { buttonId: '.ping', buttonText: { displayText: '🛰️ PING' }, type: 1 }
        ];

        const buttonMessage = {
            text: vStyle(repoBody),
            footer: 'COMRADES-MD • V_HUB UTILITY',
            buttons: buttons,
            headerType: 4,
            contextInfo: {
                externalAdReply: {
                    title: "COMRADES-MD | OFFICIAL REPO",
                    body: "Autonomous Human Simulator",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: "https://avatars.githubusercontent.com/u/144422204?v=4", 
                    sourceUrl: repoUri
                }
            }
        };

        await sock.sendMessage(from, { react: { text: "📦", key: msg.key } });
        
        // Using viewOnce to bypass the "Legacy" reply issue
        await sock.sendMessage(from, buttonMessage, { quoted: msg });
    }
};