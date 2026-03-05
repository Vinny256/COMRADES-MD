module.exports = {
    name: "menu",
    category: "general",
    execute(sock, msg, args, { prefix, commands, from, settings }) {
        // --- 🕒 Time-Based Greeting Logic ---
        const hours = new Date().getHours();
        let greeting = "Good Night";
        if (hours >= 5 && hours < 12) greeting = "Good Morning";
        else if (hours >= 12 && hours < 17) greeting = "Good Afternoon";
        else if (hours >= 17 && hours < 21) greeting = "Good Evening";

        // --- ⏱️ Uptime Calculation ---
        const uptimeSeconds = process.uptime();
        const hoursUp = Math.floor(uptimeSeconds / 3600);
        const minutesUp = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeString = `${hoursUp}h ${minutesUp}m`;

        const hubName = "VINNIE DIGITAL HUB";
        const vinnieBanner = "https://i.imgur.com/XHUY4VI.jpeg";

        // --- Group commands by category ---
        const cats = {};
        if (commands) {
            commands.forEach(cmd => {
                const category = (cmd.category || "unassigned").toLowerCase();
                if (!cats[category]) cats[category] = [];
                cats[category].push(cmd.name);
            });
        }
        const sortedCategories = Object.keys(cats).sort();

        let menu = `╭─── ~✾~ *${hubName}* ~✾~ ───\n`;
        menu += `│\n`;
        menu += `│  🌸 *${greeting},* ${msg.pushName || 'Comrade'}\n`;
        menu += `│  📊 *Commands:* ${commands.size}\n`;
        menu += `│  ⏳ *Uptime:* ${uptimeString}\n`;
        menu += `│\n`;

        // --- 📂 LOGIC: Folder Selection vs. Main Menu ---
        const selection = args[0];

        if (!selection || selection === "00") {
            // --- MAIN MENU: List Folders ---
            menu += `├────── 『 🛰️ CATEGORIES 』 ──────\n`;
            menu += `│\n`;
            sortedCategories.forEach((cat, index) => {
                menu += `│  *[ ${index + 1} ]* ${cat.toUpperCase()}\n`;
            });
            menu += `│\n`;
            menu += `│  💡 *Tip:* Type *${prefix}menu [number]*\n`;
            menu += `│  _Example: ${prefix}menu 1_\n`;
        } 
        else if (!isNaN(selection)) {
            // --- CATEGORY VIEW: List commands for specific folder ---
            const catIndex = parseInt(selection) - 1;
            const selectedCat = sortedCategories[catIndex];

            if (selectedCat) {
                menu += `├────── 『 📂 ${selectedCat.toUpperCase()} 』 ──────\n`;
                menu += `│\n`;
                cats[selectedCat].forEach(cmdName => {
                    menu += `│  ◦ ${prefix}${cmdName}\n`;
                });
                menu += `│\n`;
                menu += `│  *[ 0 ]* Back to Folders\n`;
                menu += `│  *[ 00 ]* Main Menu\n`;
            } else if (selection === "0") {
                // Return to categories (handled by re-running menu without args)
                return this.execute(sock, msg, [], { prefix, commands, from, settings });
            } else {
                menu += `│  ❌ *Invalid Category Number*\n`;
                menu += `│  Type *${prefix}menu* for list.\n`;
            }
        }

        // --- Footer Section ---
        menu += `│\n`;
        menu += `├──────────────────────────\n`;
        menu += `│   © 2026 | Vinnie Hub\n`;
        menu += `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

        // --- 🌸 SEND WITH VANTAGE STYLE (Keeping all your original styling) ---
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
