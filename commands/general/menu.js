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

        // --- Header Configuration ---
        const hubName = "VINNIE DIGITAL HUB";
        
        let menu = `╭─── ~✾~ *${hubName}* ~✾~ ───\n`;
        menu += `│\n`;
        menu += `│  🌸 *${greeting},* ${msg.pushName || 'Comrade'}\n`;
        menu += `│  ⚙️ *Prefix:* [ ${prefix} ]\n`;
        menu += `│  📊 *Commands:* ${commands.size}\n`;
        menu += `│  💧 *Impact:* Infinite\n`;
        menu += `│\n`;
        menu += `├────── 『 🛰️ STATUS 』 ──────\n`;
        menu += `│\n`;
        menu += `│  👤 *Owner:* Vinnie\n`;
        menu += `│  🚀 *Platform:* Heroku\n`;
        menu += `│  ⏳ *Uptime:* ${uptimeString}\n`;
        menu += `│  🔐 *Mode:* ${settings.mode?.toUpperCase() || 'PUBLIC'}\n`;
        menu += `│\n`;
        menu += `├──────────────────────────\n`;
        menu += `│\n`;

        // Group commands by category
        const cats = {};
        
        if (commands) {
            commands.forEach(cmd => {
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

        // --- 🖼️ OPTIMIZED IMGUR LINK ---
        const vinnieBanner = "https://i.imgur.com/XHUY4VI.jpeg";

        // --- 🌸 SEND WITH VANTAGE STYLE ---
        return sock.sendMessage(from, { 
            text: menu,
            contextInfo: {
                // 🛡️ META VERIFIED INJECTION 🛡️
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast',
                verifiedBadge: true, 
                // -----------------------------
                externalAdReply: {
                    title: "VINNIE DIGITAL HUB",
                    body: `📡 Grid Sync: ${greeting} | Up: ${uptimeString}`,
                    thumbnailUrl: vinnieBanner,
                    sourceUrl: "https://github.com/Vinny256/COMRADES-MD",
                    mediaType: 1,
                    renderLargerThumbnail: true 
                }
            }
        }, { quoted: msg });
    }
};
