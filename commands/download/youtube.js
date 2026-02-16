module.exports = {
    name: "yt",
    category: "downloader",
    desc: "Download YouTube Videos",
    async execute(sock, msg, args, { prefix }) {
        if (!args[0]) return sock.sendMessage(msg.key.remoteJid, { text: `❌ Provide a link! Example: ${prefix}yt [url]` });
        
        await sock.sendMessage(msg.key.remoteJid, { text: "⏳ Fetching video from YouTube..." });
        // Add your ytdl logic here
    }
};