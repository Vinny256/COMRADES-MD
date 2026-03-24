import fs from 'fs-extra';

const settingsFile = './settings.json';

/**
 * V-HUB_WORKER: AUTO_BIO_SYNC
 * Rotates the profile status every hour based on Kenya Time.
 */
const autoBioWorker = {
    name: "autobio_worker",
    async execute(sock, msg, settings) {
        try {
            // 1. Initial Logic Guard
            if (!settings.autobio) return;

            // 2. ⏳ HOURLY SYNC CHECK
            // Returns 0 - 23 based on the server's local time (Ensure Heroku TZ is set if needed)
            const currentHour = new Date().getHours(); 
            
            // Only update if the hour has changed since the last update to save API calls
            if (global.lastBioHour === currentHour) return;

            // 3. 📝 THE 24-HOUR VINNIE POOL (PRESERVED)
            const vinnieBios = [
                "✿ ᴛʜᴇ ᴅᴀʀᴋ ʜᴏᴜʀ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌙",       // 00:00
                "✿ sɪʟᴇɴᴛ sʏsᴛᴇᴍ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌌",     // 01:00
                "✿ ᴅʀᴇᴀᴍ ɢʀɪᴅ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 💤",         // 02:00
                "✿ ɴɪɢʜᴛ ᴏᴡʟ ᴇᴅɪᴛɪᴏɴ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🦉",  // 03:00
                "✿ ᴘʀᴇ-ᴅᴀᴡɴ sʏɴᴄ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🕯️",      // 04:00
                "✿ ᴇᴀʀʟʏ ʀɪsᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌅",         // 05:00
                "✿ ᴍᴏʀɴɪɴɢ ꜰʟᴏᴡ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ ☀️",       // 06:00
                "✿ ɢʀɪᴅ ᴀᴄᴛɪᴠᴀᴛᴇᴅ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ ⚡",     // 07:00
                "✿ sʏsᴛᴇᴍ ᴏɴʟɪɴᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🚀",      // 08:00
                "✿ ᴘᴇᴀᴋ ᴇꜰꜰɪᴄɪᴇɴᴄʏ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 📈",    // 09:00
                "✿ ʜᴜʙ ᴏᴘᴇʀᴀᴛɪᴏɴs ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 📂",     // 10:00
                "✿ ʜɪɢʜ ᴛʀᴀꜰꜰɪᴄ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🚥",       // 11:00
                "✿ ɴᴏᴏɴ ᴅᴀʏ sʏɴᴄ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🕛",       // 12:00
                "✿ ᴀꜰᴛᴇʀɴᴏᴏɴ ᴠɪʙᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ ☕",     // 13:00
                "✿ ᴘᴏᴡᴇʀ sᴇssɪᴏɴ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🔋",      // 14:00
                "✿ ᴄᴏʀᴇ ᴘʀᴏᴄᴇssɪɴɢ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ ⚙️",    // 15:00
                "✿ ɢᴏʟᴅᴇɴ ʜᴏᴜʀ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌆",         // 16:00
                "✿ sʏsᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🔄",      // 17:00
                "✿ ᴇᴠᴇɴɪɴɢ sʏɴᴄ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌃",       // 18:00
                "✿ ɴɪɢʜᴛ ᴍᴏᴅᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌑",         // 19:00
                "✿ ʜᴜʙ sᴇᴛᴛʟᴇᴍᴇɴᴛ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ ⚓",    // 20:00
                "✿ ʟᴀᴛᴇ ɴɪɢʜᴛ ᴏᴘs ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 💻",     // 21:00
                "✿ ᴅɪɢɪᴛᴀʟ sᴜʀɢᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌊",      // 22:00
                "✿ ᴍɪᴅɴɪɢʜᴛ ᴄʟᴏsᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🏁"      // 23:00
            ];

            const selectedBio = vinnieBios[currentHour] || "✿ ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ ✿";

            // 4. 🚀 PROFILE UPDATE HANDSHAKE
            await sock.updateProfileStatus(selectedBio);
            
            // Lock the hour in global memory to prevent redundant updates
            global.lastBioHour = currentHour; 
            
            console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_ʙɪᴏ_sʏɴᴄ* \n└────────────────────────┈\n\n│ 🕒 ᴛɪᴍᴇ: [${currentHour}:00]\n│ ✅ sᴛᴀᴛ: sʏɴᴄᴇᴅ\n│ 📝 ʙɪᴏ: ${selectedBio}\n└────────────────────────┈`);

        } catch (e) {
            // Silently fail to keep the message processing loop alive
        }
    }
};

export default autoBioWorker;
