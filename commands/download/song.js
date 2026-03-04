module.exports = {
    name: "song",
    category: "download",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        const query = args.join(" ");
        if (!query) return await sock.sendMessage(from, { text: `❌ *V_HUB:* What song are we looking for?\nExample: *${prefix}song Lifestyle*` });

        try {
            // 1. Give the user feedback immediately
            await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });
            await sock.sendPresenceUpdate('composing', from);

            // 2. Fetch from a high-speed YouTube to MP3 API
            // Note: I'm using a stable public API for you
            const searchApi = `https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(query)}`;
            const response = await fetch(searchApi);
            const data = await response.json();

            if (!data.status || !data.result) {
                throw new Error("Song not found or API down");
            }

            const { title, download, metadata } = data.result;

            // 3. Send the "Found it" info first
            const infoMsg = `╭─── ~✾~ *V_HUB MUSIC* ~✾~ ───\n` +
                           `│\n` +
                           `│ 🎵 *Title:* ${title}\n` +
                           `│ 📥 *Status:* Sending Audio...\n` +
                           `│\n` +
                           `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;
            
            await sock.sendMessage(from, { text: infoMsg }, { quoted: msg });

            // 4. THE MAGIC: Send the actual Audio file
            // We set 'mimetype' to 'audio/mpeg' so it shows as a playable track
            await sock.sendMessage(from, { 
                audio: { url: download }, 
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: msg });

            // 5. Success Reaction
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: `❌ *V_HUB Error:* I couldn't process that song. Try a different name.` }, { quoted: msg });
        }
    }
};
