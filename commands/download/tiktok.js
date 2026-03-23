const tiktokCommand = {
    name: "tt",
    category: "downloader",
    desc: "No-watermark TikTok downloader",
    async execute(sock, msg, args, { prefix, from }) {
        const url = args[0];

        // 1. Validation Logic
        if (!url || !url.includes("tiktok.com")) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* ${prefix}ᴛᴛ [ʟɪɴᴋ]\n└────────────────────────┈` 
            });
        }

        // Phase 1: Requesting State (Sleek UI)
        const { key } = await sock.sendMessage(from, { 
            text: `┌────────────────────────┈\n` +
                  `│      *ᴛᴛ_ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* \n` +
                  `└────────────────────────┈\n\n` +
                  `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n` +
                  `│ ⚙ *ᴛʏᴘᴇ:* ᴛɪᴋᴛᴏᴋ_ᴠɪᴅᴇᴏ\n` +
                  `│ ⚙ *sᴛᴀᴛ:* [ ғᴇᴛᴄʜɪɴɢ... ]\n` +
                  `└────────────────────────┈`
        });

        try {
            // Using native fetch for ESM stability
            const response = await fetch(`https://www.tikwm.com/api/?url=${url}`);
            const resData = await response.json();
            const data = resData.data;

            if (!data) throw new Error("Private_Link");

            const videoUrl = data.play;
            const title = data.title || "ɴᴏ_ᴛɪᴛʟᴇ";
            const author = data.author.nickname || "ᴜɴᴋɴᴏᴡɴ";

            // Phase 2: Building Premium Caption
            let caption = `┌────────────────────────┈\n`;
            caption += `│      *ᴛᴛ_ʀᴇsᴜʟᴛ* \n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `┌─『 ᴍᴇᴅɪᴀ_ᴅᴇᴛᴀɪʟs 』\n`;
            caption += `│ ⚙ *ᴜsᴇʀ:* ${author.slice(0, 15)}\n`;
            caption += `│ ⚙ *ᴅᴇsᴄ:* ${title.slice(0, 20)}...\n`;
            caption += `│ ⚙ *ǫᴜᴀʟ:* ʜᴅ_ɴᴏ_ᴡᴍ\n`;
            caption += `└────────────────────────┈\n\n`;
            caption += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // Phase 3: Send Video & Cleanup
            await sock.sendMessage(from, { 
                video: { url: videoUrl }, 
                caption: caption 
            }, { quoted: msg });

            await sock.sendMessage(from, { delete: key });

        } catch (e) {
            console.error(`❌ [TIKTOK_ERR]: ${e.message}`);
            await sock.sendMessage(from, { 
                text: `┌─『 sᴄʀᴀᴘᴇ_ᴇʀʀ 』\n│ ⚙ *sᴛᴀᴛ:* ғᴀɪʟᴇᴅ\n│ ⚙ *ᴇʀʀ:* ᴘʀɪᴠᴀᴛᴇ/ᴏғғʟɪɴᴇ\n└────────────────────────┈`, 
                edit: key 
            });
        }
    }
};

export default tiktokCommand;
