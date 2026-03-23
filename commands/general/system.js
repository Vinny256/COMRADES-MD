import os from 'os';

const systemCommand = {
    name: "system",
    category: "general",
    desc: "Show bot server status",
    async execute(sock, msg, args, { prefix, from }) {
        // --- Calculate Uptime ---
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        
        // --- Calculate RAM (Convert to GB) ---
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);

        // --- ⚡ UNICODE SLEEK STYLING ---
        let info = `┌────────────────────────┈\n`;
        info += `│      *sʏsᴛᴇᴍ_ᴅᴀsʜʙᴏᴀʀᴅ* \n`;
        info += `└────────────────────────┈\n\n`;
        
        info += `┌─『 sᴇʀᴠᴇʀ sᴛᴀᴛs 』\n`;
        info += `│ ⚙ *ʙᴏᴛ:* ᴠɪɴɴɪᴇ ʜᴜʙ v𝟽.𝟶\n`;
        info += `│ ⚙ *ʀᴜɴᴛɪᴍᴇ:* ${hours}ʜ ${minutes}ᴍ\n`;
        info += `│ ⚙ *ʀᴀᴍ ᴜsᴀɢᴇ:* ${usedMem}ɢʙ / ${totalMem}ɢʙ\n`;
        info += `│ ⚙ *ᴘʟᴀᴛғᴏʀᴍ:* ${os.platform()} (${os.arch()})\n`;
        info += `│ ⚙ *ɴᴏᴅᴇ_ᴠᴇʀ:* ${process.version}\n`;
        info += `└────────────────────────┈\n\n`;
        
        info += `┌─『 ɴᴇᴛᴡᴏʀᴋ 』\n`;
        info += `│ ◈ *sᴇʀᴠᴇʀ:* ʜᴇʀᴏᴋᴜ ᴄʟᴏᴜᴅ\n`;
        info += `│ ◈ *ʟᴀᴛᴇɴᴄʏ:* sᴛᴀʙʟᴇ ✦\n`;
        info += `└────────────────────────┈\n\n`;
        
        info += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        await sock.sendMessage(from, { 
            text: info,
            contextInfo: {
                externalAdReply: {
                    title: "sʏsᴛᴇᴍ ᴍᴏɴɪᴛᴏʀ",
                    body: `ᴄᴘᴜ: ${os.cpus().length} ᴄᴏʀᴇs | ʀᴀᴍ: ${usedMem}ɢʙ`,
                    mediaType: 1,
                    thumbnailUrl: "https://i.imgur.com/XHUY4VI.jpeg",
                    renderLargerThumbnail: false,
                    sourceUrl: "https://whatsapp.com/channel/0029Vb7ERt21SWtAHsUQ172h"
                }
            }
        }, { quoted: msg });
    }
};

export default systemCommand;
