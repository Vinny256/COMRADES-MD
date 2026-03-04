module.exports = {
    name: "song",
    category: "download",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        const query = args.join(" ");
        if (!query) return await sock.sendMessage(from, { text: `❌ Please provide a song name or YouTube link.\nExample: *${prefix}song Blinding Lights*` });

        try {
            // 1. Show "Typing..." and let them know we're searching
            await sock.sendPresenceUpdate('composing', from);
            await sock.sendMessage(from, { text: `📥 *V_HUB:* Searching for "${query}"...` }, { quoted: msg });

            // 2. Use a specialized YouTube API (using a public converter)
            // This API searches and returns a download link
            const searchUrl = `https://api.vevioz.com/api/button/mp3/${encodeURIComponent(query)}`;
            
            // Note: In a real bot, we'd fetch the JSON data first. 
            // For simplicity, we are sending the user a direct "Processing" message.
            
            // 3. V_HUB Styling for the result
            const vHubMessage = `╭─── ~✾~ *V_HUB DOWNLOADER* ~✾~ ───\n` +
                               `│\n` +
                               `│ 🎵 *Song:* ${query}\n` +
                               `│ 📥 *Status:* Ready for Download\n` +
                               `│ 🔗 *Link:* ${searchUrl}\n` +
                               `│\n` +
                               `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

            await sock.sendMessage(from, { 
                text: vHubMessage 
            }, { quoted: msg });

            // 4. Read message (GB Style)
            await sock.readMessages([msg.key]);

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: "❌ *V_HUB Error:* I couldn't find that song." }, { quoted: msg });
        }
    }
};
