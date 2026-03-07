module.exports = {
    name: "menu",
    category: "general",
    async execute(sock, msg, args, { prefix, commands, from, settings }) {
        const hours = new Date().getHours();
        let greeting = hours < 12 ? "ɢᴏᴏᴅ ᴍᴏʀɴɪɴɢ 🌅" : hours < 17 ? "ɢᴏᴏᴅ ᴀꜰᴛᴇʀɴᴏᴏɴ ☀️" : hours < 21 ? "ɢᴏᴏᴅ ᴇᴠᴇɴɪɴɢ 🌆" : "ɢᴏᴏᴅ ɴɪɢʜᴛ 🌙";

        const uptimeSeconds = process.uptime();
        const uptimeString = `${Math.floor(uptimeSeconds / 3600)}ʜ ${Math.floor((uptimeSeconds % 3600) / 60)}ᴍ`;

        const hubName = "ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ";
        
        // 🚀 GITHUB DIRECT LINK (Upload your menu video with song to assets/menu.mp4)
        const vinnieVideo = "https://raw.githubusercontent.com/Vinny256/COMRADES-MD/main/assets/menu.mp4"; 
        const vinnieThumb = "https://i.imgur.com/XHUY4VI.jpeg";
        const channelLink = "https://whatsapp.com/channel/0029Vb7ERt21SWtAHsUQ172h";

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

        // --- 🚀 NUCLEAR AUDIO-VIDEO ENGINE ---
        let videoContent = global.vinnieMenuCache ? global.vinnieMenuCache : { url: vinnieVideo };

        const sentMsg = await sock.sendMessage(from, { 
            video: videoContent,
            caption: menu,
            mimetype: 'video/mp4',
            contextInfo: {
                participant: '0@s.whatsapp.net', 
                verifiedBadge: true, 
                forwardingScore: 999,
                isForwarded: true,
                // --- 🛡️ OFFICIAL CHANNEL SYNC ---
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363305104443156@newsletter', // Your unique Channel JID
                    newsletterName: "ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ᴜᴘᴅᴀᴛᴇs",
                    serverMessageId: 1
                },
                externalAdReply: {
                    title: hubName,
                    body: `ᴏꜰꜰɪᴄɪᴀʟ ᴜᴘᴅᴀᴛᴇs | ᴜᴘᴛɪᴍᴇ: ${uptimeString}`,
                    mediaType: 2,
                    thumbnailUrl: vinnieThumb,
                    sourceUrl: channelLink, // Your new channel link
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

        // Cache the video ID for instant delivery to the next user
        if (!global.vinnieMenuCache && sentMsg.message?.videoMessage) {
            global.vinnieMenuCache = sentMsg.message.videoMessage;
        }
    }
};
