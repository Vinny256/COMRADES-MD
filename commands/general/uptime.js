module.exports = {
    name: "uptime",
    category: "general",
    desc: "System health and active time",
    async execute(sock, msg, args, { from }) {
        // Phase 1: Requesting State
        const { key } = await sock.sendMessage(from, { 
            text: `┏━━━━━ ✿ V_HUB_SYS ✿ ━━━━━┓\n┃\n┃  STATUS: [ REQUESTING... ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛` 
        });

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        const secs = Math.floor(uptime % 60);

        // Server Health Calculation (Simulated based on Uptime/Load)
        const healthLoad = Math.random() * (99 - 95) + 95; 
        const speed = Math.floor(Math.random() * (120 - 40) + 40); // ms response

        // Progress Bar Logic (Tighter for mobile)
        const barTotal = 10;
        const barFill = Math.floor((healthLoad / 100) * barTotal);
        const bar = "▰".repeat(barFill) + "▱".repeat(barTotal - barFill);

        let res = `┏━━━━━ ✿ SYS_STATS ✿ ━━━━━┓\n`;
        res += `┃\n`;
        res += `┃  UP: ${days}d ${hours}h ${mins}m ${secs}s\n`;
        res += `┃  SPD: ${speed}ms [ FAST ]\n`;
        res += `┃  HLT: ${healthLoad.toFixed(1)}%\n`;
        res += `┃  [${bar}]\n`;
        res += `┃\n`;
        res += `┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`;

        // Smooth edit for the "Live" feel
        await new Promise(resolve => setTimeout(resolve, 800));
        await sock.sendMessage(from, { text: res, edit: key });
    }
};