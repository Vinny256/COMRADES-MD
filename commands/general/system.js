const os = require('os');

module.exports = {
    name: "system",
    category: "general",
    desc: "Show bot server status",
    async execute(sock, msg, args, { prefix, from }) {
        // --- Calculate Uptime ---
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        
        // --- Calculate RAM ---
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);

        let info = `╭─── ~✾~ *SYSTEM STATUS* ~✾~ ───\n`;
        info += `│\n`;
        info += `│  🤖 *Bot:* Vinnie Hub v1.0\n`;
        info += `│  ⏳ *Uptime:* ${hours}h ${minutes}m\n`;
        info += `│  💾 *RAM:* ${usedMem}GB / ${totalMem}GB\n`;
        info += `│  🌐 *Platform:* ${os.platform()} (${os.arch()})\n`;
        info += `│  📡 *Server:* Heroku Cloud\n`;
        info += `│\n`;
        info += `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

        await sock.sendMessage(from, { text: info });
    }
};