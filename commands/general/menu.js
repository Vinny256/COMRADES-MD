module.exports = {
    name: "menu",
    category: "general",
    execute(sock, msg, args, { prefix, commands, from }) {
        // --- 🕒 Time-Based Greeting Logic ---
        const hours = new Date().getHours();
        let greeting = "Good Night";
        if (hours >= 5 && hours < 12) greeting = "Good Morning";
        else if (hours >= 12 && hours < 17) greeting = "Good Afternoon";
        else if (hours >= 17 && hours < 21) greeting = "Good Evening";

        // --- Header Configuration ---
        const hubName = "VINNIE DIGITAL HUB";
        
        let menu = `╭─── ~✾~ *${hubName}* ~✾~ ───\n`;
        menu += `│\n`;
        menu += `│  🌸 *${greeting},* ${msg.pushName || 'Comrade'}\n`;
        menu += `│  ⚙️ *Prefix:* [ ${prefix} ]\n`;
        menu += `│  📊 *Commands:* ${commands.size}\n`; // Shows total count
        menu += `│  💧 *Impact:* Infinite\n`;
        menu += `│\n`;
        menu += `├──────────────────────────\n`;
        menu += `│\n`;

        // Group commands by category
        const cats = {};
        
        if (commands) {
            commands.forEach(cmd => {
                // Use "UNASSIGNED" if no category exists to prevent empty menus
                const category = (cmd.category || "unassigned").toLowerCase();
                if (!cats[category]) cats[category] = [];
                cats[category].push(cmd.name);
            });
        }

        // --- Categories Section ---
        const sortedCategories = Object.keys(cats).sort();
        
        for (let cat of sortedCategories) {
            menu += `│  *──『 ${cat.toUpperCase()} 』──*\n`;
            cats[cat].forEach(cmdName => {
                menu += `│    ◦ ${prefix}${cmdName}\n`;
            });
            menu += `│\n`;
        }
        
        // --- Footer Section ---
        menu += `├──────────────────────────\n`;
        menu += `│    © 2026 | Vinnie Hub\n`;
        menu += `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

        // --- 🌸 SEND WITH VANTAGE STYLE ---
        return sock.sendMessage(from, { 
            text: menu,
            contextInfo: {
                externalAdReply: {
                    title: "VINNIE DIGITAL HUB",
                    body: `📡 Grid Sync: ${greeting}`,
                    thumbnailUrl: "https://vinnie-digital-hub.vercel.app/logo.png",
                    sourceUrl: "https://vinnie-digital-hub.vercel.app",
                    mediaType: 1,
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: msg });
    }
};
