module.exports = {
    name: "uptime",
    category: "general",
    desc: "Check how long the bot has been active",
    async execute(sock, msg, args, { from }) {
        const uptime = process.uptime();
        
        // Calculate Time Units
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        let res = `+--- [#] SYSTEM_UPTIME [#] ---+\n`;
        res += `|\n`;
        res += `|  DAYS: ${days}\n`;
        res += `|  HOURS: ${hours}\n`;
        res += `|  MINS: ${minutes}\n`;
        res += `|  SECS: ${seconds}\n`;
        res += `|\n`;
        res += `+--- [*] V_DIGITAL_HUB [*] ---+`;

        await sock.sendMessage(from, { text: res });
    }
};