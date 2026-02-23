module.exports = {
    name: 'repo',
    category: 'utility',
    desc: 'Consolidated Repo & Owner info.',
    async execute(sock, msg, args, { from }) {
        const repoUri = "https://github.com/Vinny256/COMRADES-MD"; 
        const ownerNumber = "254768666068";
        
        // Clean style for high-speed delivery
        const repoBody = `*🚀 COMRADES-MD CORE*\n\n` +
            `*👤 OWNER:* Vinnie\n` +
            `*🔗 REPO:* ${repoUri}\n\n` +
            `*Status:* 🟢 ONLINE\n` +
            `*Shield:* NUCLEAR SILENCE ACTIVE\n\n` +
            `_Click the link above to view source_`;

        await sock.sendMessage(from, { react: { text: "📦", key: msg.key } });

        await sock.sendMessage(from, {
            text: repoBody,
            contextInfo: {
                externalAdReply: {
                    title: "V_HUB / COMRADES-MD",
                    body: "Tap to view GitHub Repository",
                    mediaType: 1,
                    // We use a direct reliable image link to ensure it loads
                    thumbnailUrl: "https://avatars.githubusercontent.com/u/144422204?v=4", 
                    sourceUrl: repoUri,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });
    }
};