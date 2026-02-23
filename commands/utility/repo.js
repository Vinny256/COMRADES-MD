module.exports = {
    name: 'repo',
    category: 'utility',
    desc: 'Guaranteed professional repo display using V-Card and Ad-Reply.',
    async execute(sock, msg, args, { from, isMe }) {
        const repoUri = "https://github.com/Vinny256/COMRADES-MD"; 
        const ownerNumber = "254768666068";
        
        const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        const repoBody = [
            `🚀 *COMRADES-MD CORE*`,
            `*Version:* 4.0.0 (Grid Sync)`,
            `*Status:* 🟢 STABLE`,
            `*Engine:* Baileys / Node.js`,
            `\n*Click the Ad above for the Repo*`,
            `*Save the contact below for the Owner*`
        ].join('\n');

        // --- 📇 THE ARCHITECT V-CARD ---
        const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 
                      'FN:Vinnie Architect\n' + 
                      'ORG:COMRADES-MD;\n' + 
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` + 
                      'END:VCARD';

        await sock.sendMessage(from, { react: { text: "📦", key: msg.key } });

        // 1. Send the Main Hub Message with Repo Link Preview
        await sock.sendMessage(from, {
            text: vStyle(repoBody),
            contextInfo: {
                externalAdReply: {
                    title: "⭐ GET COMRADES-MD SOURCE",
                    body: "Click here to fork on GitHub",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: "https://avatars.githubusercontent.com/u/144422204?v=4", 
                    sourceUrl: repoUri
                }
            }
        }, { quoted: msg });

        // 2. Send the Contact Card immediately after
        await sock.sendMessage(from, { 
            contacts: { 
                displayName: 'Vinnie Architect', 
                contacts: [{ vcard }] 
            } 
        }, { quoted: msg });
    }
};