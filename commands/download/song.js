const yts = require('yt-search');
const fs = require('fs');
const { downloadMedia } = require('../../lib/downloader');

module.exports = {
    name: "song",
    category: "downloader",
    desc: "Search and download high-quality MP3",
    async execute(sock, msg, args, { prefix, from }) {
        const query = args.join(" ");
        if (!query) {
            return sock.sendMessage(from, { text: "┃ ❌ Error: Provide Song Name or Link" });
        }

        // Phase 1: Requesting State (Search)
        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ V_HUB_DL ✿ ━━━━━┓\n┃\n┃  TYPE: YOUTUBE_AUDIO\n┃  STAT: [ SEARCHING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
        });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) throw new Error("Not_Found");

            // Phase 2: Found State & Switch to Thumbnail
            // We delete the text box to make room for the "Premium" Image card
            await sock.sendMessage(from, { delete: key });

            const thumbMsg = await sock.sendMessage(from, {
                image: { url: video.thumbnail },
                caption: `┏━━━━━ ✿ YT_RESULT ✿ ━━━━━┓\n┃\n┃  TITLE: ${video.title.slice(0, 20)}...\n┃  DUR: ${video.timestamp}\n┃  STAT: [ INITIALIZING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`
            });

            // Phase 3: Download with Progress Bar
            // This will use the lib we built to edit the thumbnail caption
            const filePath = await downloadMedia(video.url, 'mp3', sock, from, thumbMsg.key);

            // Phase 4: Send Audio & Finalize
            await sock.sendMessage(from, { 
                audio: fs.readFileSync(filePath), 
                mimetype: 'audio/mp4',
                fileName: `${video.title}.mp3`
            }, { quoted: msg });

            // Clean up the progress bar caption to "COMPLETED"
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ YT_RESULT ✿ ━━━━━┓\n┃\n┃  TITLE: ${video.title.slice(0, 20)}...\n┃  STAT: [ COMPLETED ✅ ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`,
                edit: thumbMsg.key 
            });

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ ERROR_LOG ✿ ━━━━━┓\n┃\n┃  STAT: FAILED\n┃  ERR: ${e.message}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`
            });
        }
    }
};
