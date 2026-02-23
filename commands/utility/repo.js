module.exports = {
    name: 'repo',
    category: 'utility',
    desc: 'Fetch bot source code with guaranteed interactive List.',
    async execute(sock, msg, args, { from, isMe }) {
        const repoUri = "https://github.com/Vinny256/COMRADES-MD"; 
        const ownerNumber = "254768666068";
        
        const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        const repoBody = [
            `🚀 *COMRADES-MD CORE*`,
            `*Version:* 4.0.0 (Grid Sync)`,
            `*Status:* 🟢 STABLE`,
            `*Engine:* Baileys / Node.js`,
            `\nClick the menu button below to interact with the project.`
        ].join('\n');

        // --- 📋 LIST SECTIONS ---
        const sections = [
            {
                title: "PROJECT ACTIONS",
                rows: [
                    { title: "⭐ Fork Repo", rowId: `${repoUri}/fork`, description: "Create your own copy on GitHub" },
                    { title: "👑 Architect", rowId: `owner_contact`, description: "Chat with Vinnie" },
                    { title: "🛰️ System Ping", rowId: `.ping`, description: "Test engine latency" }
                ]
            }
        ];

        const listMessage = {
            text: vStyle(repoBody),
            footer: 'COMRADES-MD • V_HUB UTILITY',
            title: "V_HUB MANIFEST",
            buttonText: "Click for Options", // This is the button that WILL show up
            sections
        };

        await sock.sendMessage(from, { react: { text: "📦", key: msg.key } });

        // List messages are handled differently and more reliably by the WA server
        await sock.sendMessage(from, listMessage, { quoted: msg });
    }
};