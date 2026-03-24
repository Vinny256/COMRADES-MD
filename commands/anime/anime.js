import fetch from 'node-fetch';

const animeCommand = {
    // 🚀 Multi-command array for ESM loader
    name: ["hug", "slap", "pat", "kiss", "cuddle", "punch", "bite", "kill", "lick", "poke"],
    category: "anime",
    async execute(sock, msg, args, { prefix, from, command }) {
        
        try {
            // 1. Initial Reaction
            await sock.sendMessage(from, { react: { text: "✨", key: msg.key } });

            // 2. Fetch from Waifu.pics using the dynamic 'command'
            const response = await fetch(`https://api.waifu.pics/sfw/${command}`);
            
            if (!response.ok) throw new Error("API Down");
            const data = await response.json();

            // 3. Target Identification
            const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = mentioned ? `@${mentioned.split('@')[0]}` : "ᴇᴠᴇʀʏᴏɴᴇ";

            // --- ⚡ UNICODE SLEEK STYLING ---
            const vHubMessage = `┌────────────────────────┈\n` +
                                `│      *ᴀɴɪᴍᴇ_ᴀᴄᴛɪᴏɴ* \n` +
                                `└────────────────────────┈\n\n` +
                                `┌─『 ᴇᴍᴏᴛɪᴏɴ_ʟᴏɢ 』\n` +
                                `│ ⚙ *ᴀᴄᴛɪᴏɴ:* ${command.toUpperCase()}\n` +
                                `│ ⚙ *ᴛᴀʀɢᴇᴛ:* ${target}\n` +
                                `│ ⚙ *ᴠɪʙᴇ:* ᴘᴜʀᴇ ᴇᴍᴏᴛɪᴏɴ ✦\n` +
                                `└────────────────────────┈\n\n` +
                                `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // 4. Send as an Autoplay GIF
            await sock.sendMessage(from, { 
                video: { url: data.url }, 
                caption: vHubMessage,
                gifPlayback: true,
                mentions: mentioned ? [mentioned] : []
            }, { quoted: msg });

            // 5. Read Message (Status Update)
            await sock.readMessages([msg.key]);

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ᴀɴɪᴍᴇ sᴇʀᴠᴇʀ ɪs sʜʏ ʀɪɢʜᴛ ɴᴏᴡ.\n└────────────────────────┈` 
            }, { quoted: msg });
        }
    }
};

export default animeCommand;
