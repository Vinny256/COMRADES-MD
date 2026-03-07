module.exports = {
    name: "menu",
    category: "general",
    async execute(sock, msg, args, { prefix, commands, from, settings }) {
        const hours = new Date().getHours();
        let greeting = hours < 12 ? "ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ 🌅" : hours < 17 ? "ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ ☀️" : hours < 21 ? "ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ 🌆" : "ɢᴏᴏᴅ ɴɪɢʜᴛ 🌙";

        const uptimeSeconds = process.uptime();
        const hoursUp = Math.floor(uptimeSeconds / 3600);
        const minutesUp = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeString = `${hoursUp}ʜ ${minutesUp}ᴍ`;

        const hubName = "ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ";
        // Nuclear Video Source (Direct MP4)
        const vinnieVideo = "https://i.imgur.com/vH3H9O3.mp4"; 

        const cats = {};
        commands.forEach(cmd => {
            const category = (cmd.category || "unassigned").toLowerCase();
            if (!cats[category]) cats[category] = [];
            cats[category].push(cmd.name);
        });
        const sortedCategories = Object.keys(cats).sort();

        let menu = `┏━━━━━━ ✿ *${hubName}* ✿ ━━━━━━┓\n┃\n`;
        menu += `┃  ✨ *${greeting}*\n`;
        menu += `┃  👤 *ᴜsᴇʀ:* ${msg.pushName || 'ᴄᴏᴍʀᴀᴅᴇ'}\n`;
        menu += `┃  📊 *ᴄᴏᴍᴍᴀɴᴅs:* ${commands.size}\n`;
        menu += `┃  ⏳ *ᴜᴘᴛɪᴍᴇ:* ${uptimeString}\n┃\n`;

        const selection = args[0];
        if (!selection || selection === "00") {
            menu += `┣────── 『 🛰️ **ᴄᴀᴛᴇɢᴏʀɪᴇs** 』 ──────\n┃\n`;
            sortedCategories.forEach((cat, index) => {
                menu += `┃  *[ ${index + 1} ]* ${cat.toUpperCase()}\n`;
            });
            menu += `┃\n┃  💡 *ᴛɪᴘ:* ᴛʏᴘᴇ ᴛʜᴇ ɴᴜᴍʙᴇʀ ᴏɴʟʏ\n`;
        } else if (!isNaN(selection)) {
            const catIndex = parseInt(selection) - 1;
            const selectedCat = sortedCategories[catIndex];
            if (selectedCat) {
                menu += `┣────── 『 📂 **${selectedCat.toUpperCase()}** 』 ──────\n┃\n`;
                cats[selectedCat].forEach(cmdName => {
                    menu += `┃  ◦ ${prefix}${cmdName}\n`;
                });
                menu += `┃\n┃  *[ 0 ]* ʙᴀᴄᴋ\n┃  *[ 00 ]* ᴍᴀɪɴ ᴍᴇɴᴜ\n`;
            } else if (selection === "0") {
                return this.execute(sock, msg, [], { prefix, commands, from, settings });
            }
        }

        menu += `┃\n┣──────────────────────────\n┃   © 2026 | ᴠɪɴɴɪᴇ ʜᴜʙ\n┗━━━━━ ~✾~ *ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ* ~✾~ ━━━━━┛`;

        // --- 🚀 GHOST REDIRECT ENGINE (Saves Bandwidth) ---
        // If we already have the video ID, we use it for instant delivery
        let videoMessage = { url: vinnieVideo };
        if (global.vinnieMenuCache) {
            videoMessage = global.vinnieMenuCache;
        }

        const sentMsg = await sock.sendMessage(from, { 
            video: videoMessage,
            caption: menu,
            gifPlayback: true, // Auto-plays immediately
            contextInfo: {
                participant: '0@s.whatsapp.net', 
                verifiedBadge: true, 
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363305104443156@newsletter',
                    newsletterName: "ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ᴜᴘᴅᴀᴛᴇs",
                    serverMessageId: 1
                },
                externalAdReply: {
                    title: hubName,
                    body: `sʏsᴛᴇᴍ ᴏɴʟɪɴᴇ | ᴠᴇʀɪꜰɪᴇᴅ ʜᴜʙ`,
                    mediaType: 2,
                    thumbnailUrl: "https://i.imgur.com/XHUY4VI.jpeg",
                    sourceUrl: "https://github.com/Vinny256/COMRADES-MD",
                    showAdAttribution: true 
                }
            }
        }, { quoted: msg });

        // Cache the video ID so next time is 0.5s speed
        if (!global.vinnieMenuCache && sentMsg.message?.videoMessage) {
            global.vinnieMenuCache = sentMsg.message.videoMessage;
        }
    }
};
