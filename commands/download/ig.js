const axios = require('axios');

module.exports = {
    name: "ig",
    category: "downloader",
    desc: "Download Instagram Reels & Posts",
    async execute(sock, msg, args, { prefix, from }) {
        const url = args[0];
        if (!url || !url.includes("instagram.com")) {
            return sock.sendMessage(from, { text: "┃ ❌ Error: Provide IG Link" });
        }

        // Phase 1: Extraction State (Premium Frame)
        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ V_HUB_IG ✿ ━━━━━┓\n┃\n┃  TYPE: REELS_POST\n┃  STAT: [ EXTRACTING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
        });

        try {
            const res = await axios.get(`https://api.vreden.my.id/api/igdl?url=${url}`);
            const result = res.data.result[0]; 

            if (!result || !result.url) throw new Error("No_Media");

            // Phase 2: Sending State
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ V_HUB_IG ✿ ━━━━━┓\n┃\n┃  FILE: MP4_VIDEO\n┃  STAT: [ SENDING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`, 
                edit: key 
            });

            // Phase 3: Final Caption (Tight Width)
            let caption = `┏━━━━━ ✿ IG_RESULT ✿ ━━━━━┓\n`;
            caption += `┃\n`;
            caption += `┃  SRC: INSTAGRAM\n`;
            caption += `┃  QUAL: HIGH_RES\n`;
            caption += `┃  TYPE: REEL_VIDEO\n`;
            caption += `┃\n`;
            caption += `┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`;

            await sock.sendMessage(from, { 
                video: { url: result.url }, 
                caption: caption 
            }, { quoted: msg });

            // Clean up the status message
            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┏━━━━━ ✿ ERROR_LOG ✿ ━━━━━┓\n┃\n┃  STAT: FAILED\n┃  ERR: PRIVATE/INVALID\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━┛`, 
                edit: key 
            });
        }
    }
};