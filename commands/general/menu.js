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
        commands.forEach(cmd => {
            const category = cmd.category || "others";
            if (!cats[category]) cats[category] = [];
            cats[category].push(cmd.name);
        });

        // --- Categories with Left Binding ---
        for (let cat in cats) {
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
                    sourceUrl: "https://vinnie-digital-hub.vercel.app",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        });
    }
};