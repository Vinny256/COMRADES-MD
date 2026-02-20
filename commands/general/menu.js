module.exports = {
    name: "menu",
    category: "general",
    execute(sock, msg, args, { prefix, commands, from }) {
        // --- Header Configuration ---
        const hubName = "VINNIE DIGITAL HUB";
        
        let menu = `╭─── ~✾~ *${hubName}* ~✾~ ───\n`;
        menu += `│\n`;
        menu += `│  👤 *User:* ${msg.pushName || 'Comrade'}\n`;
        menu += `│  ⚙️ *Prefix:* [ ${prefix} ]\n`;
        menu += `│  💧 *Impact:* Infinite\n`;
        menu += `│\n`;
        menu += `├──────────────────────────\n`;
        menu += `│\n`;

        // Group commands by category
        const cats = {};
        
        // Ensure commands exists and is iterable
        if (commands) {
            commands.forEach(cmd => {
                // Normalize category name to avoid duplicates like "General" vs "general"
                const category = (cmd.category || "others").toLowerCase();
                if (!cats[category]) cats[category] = [];
                cats[category].push(cmd.name);
            });
        }

        // --- Categories with Left Binding ---
        const sortedCategories = Object.keys(cats).sort();
        
        for (let cat of sortedCategories) {
            menu += `│  *──『 ${cat.toUpperCase()} 』──*\n`;
            cats[cat].forEach(cmdName => {
                menu += `│   ◦ ${prefix}${cmdName}\n`;
            });
            menu += `│\n`;
        }
        
        // --- Footer Section ---
        menu += `├──────────────────────────\n`;
        menu += `│    © 2026 | Vinnie Hub\n`;
        menu += `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

        return sock.sendMessage(from, { 
            text: menu,
            contextInfo: {
                externalAdReply: {
                    title: "VINNIE DIGITAL HUB",
                    body: "Online & Active",
                    thumbnailUrl: "https://vinnie-digital-hub.vercel.app/logo.png",
                    sourceUrl: "https://vinnie-digital-hub.vercel.app",
                    mediaType: 1,
                    renderLargerThumbnail: true // Changed to true for a better look
                }
            }
        }, { quoted: msg });
    }
};