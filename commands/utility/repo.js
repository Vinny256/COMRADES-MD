module.exports = {
    name: 'repo',
    category: 'utility',
    desc: 'Elite Project Dashboard for COMRADES-MD',
    async execute(sock, msg, args, { from, isMe }) {
        const repoUri = "https://github.com/Vinny256/COMRADES-MD"; 
        const ownerNumber = "254768666068";
        
        // Dynamic Repo Card - Shows real-time stats visually
        const githubCard = `https://opengraph.githubassets.com/1/Vinny256/COMRADES-MD`;

        // Elite Dashboard Styling
        const dashboard = `
╔════════════════════╗
║    🛰️  *V_HUB TERMINAL* 🛰️    ║
╠════════════════════╣
  ✨ *PROJECT:* COMRADES-MD
  📂 *REPO:* github.com/Vinny256
  🛡️ *VERSION:* 4.0.0-Stable
  🌀 *ENGINE:* Grid Sync v2

  📊 *SYSTEM STATUS:*
  ┣ [██████████] 100%
  ┣ 🟢 Connection: SECURE
  ┗ 🟢 MAC Shield: ACTIVE

  💡 *INSTRUCTIONS:*
  • _Tap the image above for Source_
  • _Save the card below for Owner_
╚════════════════════╝`.trim();

        // High-End V-Card with Social Links
        const vcard = 'BEGIN:VCARD\n' + 'VERSION:3.0\n' + 
                      'FN:Vinnie (Architect)\n' + 
                      'ORG:COMRADES-MD DEVELOPMENT;\n' + 
                      'TITLE:Lead Developer\n' +
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}\n` + 
                      `URL;type=GitHub:${repoUri}\n` +
                      'END:VCARD';

        await sock.sendMessage(from, { react: { text: "💎", key: msg.key } });

        // Phase 1: The Visual Dashboard
        await sock.sendMessage(from, {
            text: dashboard,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "🚀 COMRADES-MD: SOURCE ENGINE",
                    body: "Design by Vinnie • Click to Fork",
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    thumbnailUrl: githubCard, 
                    sourceUrl: repoUri,
                    showAdAttribution: true // Adds the "Ad" badge for elite feel
                }
            }
        }, { quoted: msg });

        // Phase 2: The Contact Drop
        await sock.sendMessage(from, { 
            contacts: { 
                displayName: 'Vinnie Architect', 
                contacts: [{ vcard }] 
            } 
        }, { quoted: msg });
    }
};