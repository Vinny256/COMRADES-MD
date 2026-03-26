import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import baileys from "@whiskeysockets/baileys";

// ESM fix for __dirname to ensure local assets load correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 CUSTOM STABLE DELAY (Fixes the 'delay is not a function' error)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const menuCommand = {
    name: "menu",
    category: "general",
    async execute(sock, msg, args, { prefix, commands, from, settings }) {
        try {
            // --- 🛡️ THE GHOST QUOTE (META AI VERIFICATION) ---
            // Creates a fake quote from Meta AI to show verification text
            const metaAIQuote = {
                key: { 
                    remoteJid: from, 
                    fromMe: false, 
                    id: 'V-HUB-VERIFY-' + Date.now(), 
                    participant: '0@s.whatsapp.net' 
                },
                message: { 
                    conversation: "ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ: sʏsᴛᴇᴍ ᴠᴇʀɪꜰɪᴇᴅ ✅" 
                }
            };

            // --- ⏳ STEP 1: THE SYNC POKE (COUNTDOWN) ---
            // Sending a light message first to open the sync pipe
            let { key } = await sock.sendMessage(from, { text: "⏳ *V-HUB ENGINE INITIALIZING... 10%*" }, { quoted: metaAIQuote });
            
            await sleep(800);
            await sock.sendMessage(from, { edit: key, text: "⏳ *V-HUB ENGINE INITIALIZING... 50%*" });
            
            await sleep(800);
            await sock.sendMessage(from, { edit: key, text: "⏳ *V-HUB ENGINE INITIALIZING... 100%*" });

            // --- 📂 DATA ENGINE ---
            const hours = new Date().getHours();
            // Replacing emojis with clean Unicode Status indicators
            let greeting = hours < 12 ? "ᴍᴏʀɴɪɴɢ ✧" : hours < 17 ? "ᴀꜰᴛᴇʀɴᴏᴏɴ ✦" : hours < 21 ? "ᴇᴠᴇɴɪɴɢ ✧" : "ɴɪɢʜᴛ ✦";
            const uptimeSeconds = process.uptime();
            const uptimeString = `${Math.floor(uptimeSeconds / 3600)}ʜ ${Math.floor((uptimeSeconds % 3600) / 60)}ᴍ`;
            const hubName = "ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ";

            const cats = {};
            commands.forEach(cmd => {
                const category = (cmd.category || "General").toUpperCase();
                if (!cats[category]) cats[category] = [];
                const cmdName = Array.isArray(cmd.name) ? cmd.name[0] : cmd.name;
                if (!cats[category].includes(cmdName)) cats[category].push(cmdName);
            });
            const sortedCategories = Object.keys(cats).sort();

            // --- ⚡ UNICODE SLEEK ENGINE (RETAINED SEPARATORS) ---
            let menu = `┌────────────────────────┈\n`;
            menu += `│      *${hubName}* \n`;
            menu += `└────────────────────────┈\n\n`;
            
            menu += `┌─『 sʏsᴛᴇᴍ sᴛᴀᴛᴜs 』\n`;
            menu += `│ ⚙ *ɪᴅᴇɴᴛɪᴛʏ:* ${msg.pushName || 'ᴄᴏᴍʀᴀᴅᴇ'}\n`;
            menu += `│ ⚙ *ʀᴜɴᴛɪᴍᴇ:* ${uptimeString}\n`;
            menu += `│ ⚙ *ᴠᴇʀsɪᴏɴ:* ᴠ𝟽.𝟶.𝟶\n`;
            menu += `│ ⚙ *ᴘʀᴇғɪx:* [ ${prefix} ]\n`;
            menu += `└────────────────────────┈\n\n`;

            for (const cat of sortedCategories) {
                menu += `┌──『 *${cat}* 』\n`;
                const categoryCommands = cats[cat].sort();
                for (let i = 0; i < categoryCommands.length; i++) {
                    const isLast = i === categoryCommands.length - 1;
                    menu += `│ ${isLast ? '╰' : '├'}─◈ *${prefix}${categoryCommands[i]}*\n`;
                }
                menu += `└────────────────────────┈\n\n`;
            }
            menu += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // --- 🚀 STEP 2: THE FINAL EDIT ---
            // Editing the countdown message to be the "System Ready" header
            await sock.sendMessage(from, { edit: key, text: `✅ *sʏsᴛᴇᴍ ʀᴇᴀᴅʏ*\n${greeting} ${msg.pushName || ''}` });

            // --- 🎥 STEP 3: THE VIDEO DISPATCH (STABLE) ---
            const localVideoPath = path.join(__dirname, '../../assets/menu.mp4');
            const vinnieVideo = "https://raw.githubusercontent.com/Vinny256/COMRADES-MD/main/assets/menu.mp4"; 
            const vinnieThumb = "https://i.imgur.com/XHUY4VI.jpeg";
            const channelLink = "https://whatsapp.com/channel/0029Vb7ERt21SWtAHsUQ172h";

            let videoSource = fs.existsSync(localVideoPath) ? { url: localVideoPath } : { url: vinnieVideo };
            let videoContent = global.vinnieMenuCache ? global.vinnieMenuCache : videoSource;

            const sentMsg = await sock.sendMessage(from, { 
                video: videoContent,
                caption: menu,
                mimetype: 'video/mp4',
                gifPlayback: true, // Forces it to behave like a GIF for faster preview sync
                contextInfo: {
                    // Using the actual sender JID or a real formatted JID for stability
                    participant: '254768666068@s.whatsapp.net', 
                    verifiedBadge: true, 
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363305104443156@newsletter', 
                        newsletterName: "ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ᴜᴘᴅᴀᴛᴇs",
                        serverMessageId: 1
                    },
                    externalAdReply: {
                        title: hubName,
                        body: "sʏsᴛᴇᴍ ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ",
                        mediaType: 2, // Video thumbnail type
                        thumbnailUrl: vinnieThumb,
                        sourceUrl: channelLink, 
                        showAdAttribution: true,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: metaAIQuote }); // 🛡️ Quoting the Meta AI object instead of the user message

            if (!global.vinnieMenuCache && sentMsg.message?.videoMessage) {
                global.vinnieMenuCache = sentMsg.message.videoMessage;
            }

        } catch (e) {
            console.error("V-HUB MENU CRASH:", e);
            await sock.sendMessage(from, { text: "⚠️ System Overload: Sync Failed." });
        }
    }
};

export default menuCommand;
