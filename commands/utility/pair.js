import axios from 'axios';

// Global tracker to prevent API abuse (stays in memory)
const pairTracker = new Map();

const pairCommand = {
    name: 'pair',
    category: 'utility',
    desc: 'Generate a Vinnie Hub Pairing Code with auto-fix for Kenyan numbers.',
    async execute(sock, msg, args, { from, prefix }) {
        let input = args[0];

        // --- 🛡️ 1. VALIDATION & KENYAN NUMBER FIX ---
        if (!input) {
            return await sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ᴘᴀɪʀ [ᴘʜᴏɴᴇ]\n│ 🇰ᴇ *ᴇx:* ${prefix}ᴘᴀɪʀ 𝟶𝟽𝟾𝟾... \n└────────────────────────┈` 
            }, { quoted: msg });
        }

        // Clean all non-numeric characters
        let cleanedNumber = input.replace(/\D/g, "");

        // Auto-fix logic for Kenyan local formats (7.../1... or 07.../01...)
        if (cleanedNumber.startsWith('7') || cleanedNumber.startsWith('1')) {
            cleanedNumber = '254' + cleanedNumber;
        } else if (cleanedNumber.startsWith('07') || cleanedNumber.startsWith('01')) {
            cleanedNumber = '254' + cleanedNumber.substring(1);
        }

        // --- ⏳ 2. RATE LIMITER (COOLDOWN) ---
        const now = Date.now();
        if (pairTracker.has(from)) {
            const expiration = pairTracker.get(from) + 60000; // 1 minute cooldown
            if (now < expiration) {
                const timeLeft = ((expiration - now) / 1000).toFixed(0);
                return await sock.sendMessage(from, { 
                    text: `┌─『 sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ 』\n│ ⏳ *ᴄᴏᴏʟᴅᴏᴡɴ_ᴀᴄᴛɪᴠᴇ*\n│ ⚙ ᴡᴀɪᴛ: ${timeLeft}s\n└────────────────────────┈` 
                }, { quoted: msg });
            }
        }

        // --- ✦ 3. VISUAL FEEDBACK ---
        await sock.sendMessage(from, { react: { text: "🛰️", key: msg.key } });
        
        // Initial status message
        const { key } = await sock.sendMessage(from, { 
            text: `┌─『 ᴠ_ʜᴜʙ_ᴇɴɢɪɴᴇ 』\n│ 📡 ᴄᴏɴɴᴇᴄᴛɪɴɢ_ᴛᴏ_ʙᴀᴄᴋᴇɴᴅ...\n└────────────────────────┈` 
        }, { quoted: msg });

        try {
            // --- 🚀 4. REQUESTING CODE FROM HEROKU BACKEND ---
            const backendUrl = 'https://vinnie-unit-3203-24d1ba2bf4f1.herokuapp.com/start-pairing';
            const response = await axios.post(backendUrl, { phoneNumber: cleanedNumber }, { timeout: 20000 });

            if (response.data && response.data.code) {
                const pairCode = response.data.code.toUpperCase();

                // --- 📑 SUCCESS UI CONSTRUCTION ---
                let pairLog = `┌────────────────────────┈\n`;
                pairLog += `│      *ᴠ-ʜᴜʙ_ᴘᴀɪʀɪɴɢ_ʟᴏɢ* \n`;
                pairLog += `└────────────────────────┈\n\n`;
                
                pairLog += `┌─『 sʏsᴛᴇᴍ_ʜᴀɴᴅsʜᴀᴋᴇ 』\n`;
                pairLog += `│ 🛰️ *ᴇɴɢɪɴᴇ:* ʀᴇᴀᴅʏ\n`;
                pairLog += `│ 👤 *ᴛᴀʀɢᴇᴛ:* +${cleanedNumber}\n`;
                pairLog += `│ ⚙ *sᴛᴀᴛᴜs:* ᴄᴏᴅᴇ_ɢᴇɴᴇʀᴀᴛᴇᴅ\n`;
                pairLog += `└────────────────────────┈\n\n`;
                
                pairLog += `┌─『 ʟɪɴᴋ_ɪɴsᴛʀᴜᴄᴛɪᴏɴs 』\n`;
                pairLog += `│ 𝟷. ᴡᴀ > ʟɪɴᴋᴇᴅ_ᴅᴇᴠɪᴄᴇs\n`;
                pairLog += `│ 𝟸. ᴛᴀᴘ 'ʟɪɴᴋ_ᴡɪᴛʜ_ᴘʜᴏɴᴇ_ɴᴜᴍʙᴇʀ'\n`;
                pairLog += `│ 𝟹. ᴇɴᴛᴇʀ ᴛʜᴇ ᴄᴏᴅᴇ ʙᴇʟᴏᴡ.\n`;
                pairLog += `└────────────────────────┈\n\n`;
                
                pairLog += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

                await sock.sendMessage(from, { 
                    text: pairLog,
                    contextInfo: {
                        externalAdReply: {
                            title: "V_HUB PAIRING HANDSHAKE",
                            body: "Grid Sync v4.0 Online",
                            mediaType: 1,
                            thumbnailUrl: "https://avatars.githubusercontent.com/u/144422204?v=4",
                            sourceUrl: "https://github.com/Vinny256/COMRADES-MD"
                        }
                    }
                }, { quoted: msg });

                // --- 🔑 SEPARATE MESSAGE FOR EASY COPYING ---
                await sock.sendMessage(from, { text: pairCode });

                // Update tracker for cooldown
                pairTracker.set(from, now);
                
                // Cleanup status message
                await sock.sendMessage(from, { delete: key });

            } else {
                throw new Error("ɪɴᴠᴀʟɪᴅ_sᴇʀᴠᴇʀ_ʀᴇsᴘᴏɴsᴇ");
            }

        } catch (error) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ʙᴀᴄᴋᴇɴᴅ_ᴏғғʟɪɴᴇ*\n│ ⚙ ʟᴏɢ: sᴇʀᴠᴇʀ_ᴜɴʀᴇᴀᴄʜᴀʙʟᴇ\n└────────────────────────┈`,
                edit: key 
            });
        }
    }
};

export default pairCommand;
