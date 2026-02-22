const fs = require('fs-extra');
const settingsFile = './settings.json';

module.exports = async (sock, msg, settings) => {
    try {
        // --- 🛡️ SETTINGS CHECK ---
        if (!settings.autobio) return;

        // --- ⏳ HOURLY SYNC CHECK ---
        const currentHour = new Date().getHours(); // Returns 0 - 23
        
        // Only update if the hour has changed since the last update
        if (global.lastBioHour === currentHour) return;

        // --- 📝 THE 24-HOUR VINNIE POOL ---
        // Each line corresponds to an hour of the day (0 = Midnight, 13 = 1 PM, etc.)
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
            "✿ ɢᴏʟᴅᴇɴ ʜᴏᴜʀ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌆",        // 16:00
            "✿ sʏsᴛᴇᴍ ᴜᴘᴅᴀᴛᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🔄",      // 17:00
            "✿ ᴇᴠᴇɴɪɴɢ sʏɴᴄ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌃",       // 18:00
            "✿ ɴɪɢʜᴛ ᴍᴏᴅᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌑",         // 19:00
            "✿ ʜᴜʙ sᴇᴛᴛʟᴇᴍᴇɴᴛ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ ⚓",    // 20:00
            "✿ ʟᴀᴛᴇ ɴɪɢʜᴛ ᴏᴘs ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 💻",     // 21:00
            "✿ ᴅɪɢɪᴛᴀʟ sᴜʀɢᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🌊",      // 22:00
            "✿ ᴍɪᴅɴɪɢʜᴛ ᴄʟᴏsᴇ ✿ ᴠɪɴɴɪᴇ ʜᴜʙ 🏁"      // 23:00
        ];

        const selectedBio = vinnieBios[currentHour];

        // --- 🚀 UPDATE PROFILE ---
        await sock.updateProfileStatus(selectedBio);
        
        global.lastBioHour = currentHour; // Lock the hour so it doesn't repeat
        console.log(`[${currentHour}:00] ✅ Bio Synced: ${selectedBio}`);

    } catch (e) {
        // Keeps the queue moving even if the update fails
    }
};