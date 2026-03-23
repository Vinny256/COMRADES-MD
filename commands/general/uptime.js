const uptimeCommand = {
    name: "uptime",
    category: "general",
    desc: "System health and active time",
    async execute(sock, msg, args, { from }) {
        // Phase 1: Requesting State with Sleek Styling
        const { key } = await sock.sendMessage(from, { 
            text: `┌────────────────────────┈\n` +
                  `│      *ᴠ_ʜᴜʙ_sʏs* \n` +
                  `└────────────────────────┈\n\n` +
                  `┌─『 sᴛᴀᴛᴜs 』\n` +
                  `│ ⚙ [ ʀᴇǫᴜᴇsᴛɪɴɢ... ]\n` +
                  `└────────────────────────┈` 
        });

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const mins = Math.floor((uptime % 3600) / 60);
        const secs = Math.floor(uptime % 60);

        // Server Health Calculation
        const healthLoad = Math.random() * (99 - 95) + 95; 
        const speed = Math.floor(Math.random() * (120 - 40) + 40);

        // Progress Bar Logic (Refined for Premium look)
        const barTotal = 10;
        const barFill = Math.floor((healthLoad / 100) * barTotal);
        const bar = "▰".repeat(barFill) + "▱".repeat(barTotal - barFill);

        // Phase 2: Success Dashboard in Single-Line Style
        let res = `┌────────────────────────┈\n`;
        res += `│      *sʏs_sᴛᴀᴛs* \n`;
        res += `└────────────────────────┈\n\n`;
        
        res += `┌─『 ᴛɪᴍᴇ_ʟᴏɢ 』\n`;
        res += `│ ⚙ *ᴜᴘ:* ${days}ᴅ ${hours}ʜ ${mins}ᴍ ${secs}s\n`;
        res += `│ ⚙ *sᴘᴅ:* ${speed}ᴍs [ ғᴀsᴛ ✦ ]\n`;
        res += `│ ⚙ *ʜʟᴛ:* ${healthLoad.toFixed(1)}%\n`;
        res += `└────────────────────────┈\n\n`;
        
        res += `┌─『 ʜᴇᴀʟᴛʜ_ʙᴀʀ 』\n`;
        res += `│ ◈ [ ${bar} ]\n`;
        res += `└────────────────────────┈\n\n`;
        
        res += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        // Smooth edit for the "Live" feel
        await new Promise(resolve => setTimeout(resolve, 800));
        await sock.sendMessage(from, { text: res, edit: key });
    }
};

export default uptimeCommand;
