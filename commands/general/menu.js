module.exports = {
    name: "menu",
    category: "general",
    execute(sock, msg, args, { prefix, commands, from, settings }) {
        const hours = new Date().getHours();
        let greeting = hours < 12 ? "Good Morning" : hours < 17 ? "Good Afternoon" : hours < 21 ? "Good Evening" : "Good Night";

        const uptimeSeconds = process.uptime();
        const hoursUp = Math.floor(uptimeSeconds / 3600);
        const minutesUp = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeString = `${hoursUp}h ${minutesUp}m`;

        const hubName = "VINNIE DIGITAL HUB";
        const vinnieBanner = "https://i.imgur.com/XHUY4VI.jpeg";

        const cats = {};
        commands.forEach(cmd => {
            const category = (cmd.category || "unassigned").toLowerCase();
            if (!cats[category]) cats[category] = [];
            cats[category].push(cmd.name);
        });
        const sortedCategories = Object.keys(cats).sort();

        let menu = `╭─── ~✾~ *${hubName}* ~✾~ ───\n`;
        menu += `│\n│  🌸 *${greeting},* ${msg.pushName || 'Comrade'}\n`;
        menu += `│  📊 *Commands:* ${commands.size}\n│  ⏳ *Uptime:* ${uptimeString}\n│\n`;

        const selection = args[0];
        if (!selection || selection === "00") {
            menu += `├────── 『 🛰️ CATEGORIES 』 ──────\n│\n`;
            sortedCategories.forEach((cat, index) => {
                menu += `│  *[ ${index + 1} ]* ${cat.toUpperCase()}\n`;
            });
            menu += `│\n│  💡 *Tip:* Type *[number]*\n`;
        } else if (!isNaN(selection)) {
            const catIndex = parseInt(selection) - 1;
            const selectedCat = sortedCategories[catIndex];
            if (selectedCat) {
                menu += `├────── 『 📂 ${selectedCat.toUpperCase()} 』 ──────\n│\n`;
                cats[selectedCat].forEach(cmdName => {
                    menu += `│  ◦ ${prefix}${cmdName}\n`;
                });
                menu += `│\n│  *[ 0 ]* Back to Folders\n│  *[ 00 ]* Main Menu\n`;
            } else if (selection === "0") {
                return this.execute(sock, msg, [], { prefix, commands, from, settings });
            }
        }

        menu += `│\n├──────────────────────────\n│   © 2026 | Vinnie Hub\n╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

        return sock.sendMessage(from, { 
            text: menu,
            contextInfo: {
                participant: '0@s.whatsapp.net', 
                verifiedBadge: true, 
                isForwarded: true, 
                forwardingScore: 999,
                verifiedName: "VINNIE DIGITAL HUB",
                externalAdReply: {
                    title: "VINNIE DIGITAL HUB",
                    body: `📡 Grid Sync: ${greeting} | Up: ${uptimeString}`,
                    thumbnailUrl: vinnieBanner,
                    sourceUrl: "https://github.com/Vinny256/COMRADES-MD",
                    mediaType: 1,
                    showAdAttribution: true, 
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: msg });
    }
};
