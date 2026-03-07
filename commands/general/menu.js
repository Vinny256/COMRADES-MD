module.exports = {
    name: "menu",
    category: "general",
    async execute(sock, msg, args, { prefix, commands, from, settings }) {
        const hours = new Date().getHours();
        let greeting = hours < 12 ? "ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ 🌅" : hours < 17 ? "ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ ☀️" : hours < 21 ? "ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ 🌆" : "ɢᴏᴏᴅ ɴɪɢʜᴛ 🌙";

        const uptimeSeconds = process.uptime();
        const uptimeString = `${Math.floor(uptimeSeconds / 3600)}ʜ ${Math.floor((uptimeSeconds % 3600) / 60)}ᴍ`;

        // 🔥 NUCLEAR BYPASS LINK (Alternative to Imgur)
        // If Imgur keeps failing, upload your mp4 to a GitHub repo and use the 'Raw' link.
        const vinnieVideo = "https://raw.githubusercontent.com/Vinny256/V-HUB-MEDIA/main/menu.mp4"; 

        const cats = {};
        commands.forEach(cmd => {
            const category = (cmd.category || "unassigned").toLowerCase();
            if (!cats[category]) cats[category] = [];
            cats[category].push(cmd.name);
        });
        const sortedCategories = Object.keys(cats).sort();

        let menu = `┏━━━━━━ ✿ *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ* ✿ ━━━━━━┓\n┃\n`;
        menu += `┃  ✨ *${greeting}*\n┃  📊 *ᴄᴏᴍᴍᴀɴᴅs:* ${commands.size}\n┃  ⏳ *ᴜᴘᴛɪᴍᴇ:* ${uptimeString}\n┃\n`;

        const selection = args[0];
        if (!selection || selection === "00") {
            menu += `┣────── 『 🛰️ **ᴄᴀᴛᴇɢᴏʀɪᴇs** 』 ──────\n┃\n`;
            sortedCategories.forEach((cat, index) => {
                menu += `┃  *[ ${index + 1} ]* ${cat.toUpperCase()}\n`;
            });
        } else if (!isNaN(selection)) {
            const catIndex = parseInt(selection) - 1;
            const selectedCat = sortedCategories[catIndex];
            if (selectedCat) {
                menu += `┣────── 『 📂 **${selectedCat.toUpperCase()}** 』 ──────\n┃\n`;
                cats[selectedCat].forEach(cmdName => {
                    menu += `┃  ◦ ${prefix}${cmdName}\n`;
                });
                menu += `┃\n┃  *[ 0 ]* ʙᴀᴄᴋ | *[ 00 ]* ᴍᴇɴᴜ\n`;
            }
        }

        menu += `┃\n┣──────────────────────────\n┃   © 2026 | ᴠɪɴɴɪᴇ ʜᴜʙ\n┗━━━━━ ~✾~ *ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ* ~✾~ ━━━━━┛`;

        try {
            // 🚀 SMART CACHE CHECK
            let videoOption = global.vinnieMenuCache ? global.vinnieMenuCache : { url: vinnieVideo };

            const sentMsg = await sock.sendMessage(from, { 
                video: videoOption,
                caption: menu,
                gifPlayback: true,
                contextInfo: {
                    externalAdReply: {
                        title: "ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ",
                        body: "sʏsᴛᴇᴍ ᴏɴʟɪɴᴇ | ᴠᴇʀɪꜰɪᴇᴅ",
                        mediaType: 2,
                        thumbnailUrl: "https://i.imgur.com/XHUY4VI.jpeg",
                        sourceUrl: "https://github.com/Vinny256/COMRADES-MD",
                        showAdAttribution: true 
                    }
                }
            }, { quoted: msg });

            // SAVES THE REAL VIDEO ID TO PREVENT 2.7KB GHOSTS
            if (!global.vinnieMenuCache && sentMsg.message?.videoMessage) {
                global.vinnieMenuCache = sentMsg.message.videoMessage;
            }
        } catch (e) {
            // FALLBACK TO TEXT IF VIDEO FAILS
            return sock.sendMessage(from, { text: menu }, { quoted: msg });
        }
    }
};
