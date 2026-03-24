import pkg from "@whiskeysockets/baileys";
const { DisconnectReason } = pkg;

/**
 * V-HUB_EVENT: CONNECTION_HANDLER
 * Handles the socket lifecycle, reconnection, and sync status.
 */
const connectionHandler = async (u, startVinnieHub) => {
    const { connection, lastDisconnect } = u;

    // --- ✅ CONNECTION OPENED ---
    if (connection === 'open') {
        global.connectionOpenTime = Date.now();
        console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_ɢʀɪᴅ_sʏɴᴄ* \n└────────────────────────┈\n\n┌─『 sʏsᴛᴇᴍ_sᴛᴀᴛᴜs 』\n│ 🛰️ *ᴇɴɢɪɴᴇ:* ᴏɴʟɪɴᴇ\n│ ✅ *ɢʀɪᴅ:* sʏɴᴄ_ᴄᴏɴғɪʀᴍᴇᴅ\n│ 🛡️ *sʜɪᴇʟᴅ:* ᴀᴄᴛɪᴠᴇ\n└────────────────────────┈\n`);
    }

    // --- ❌ CONNECTION CLOSED ---
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        
        // Don't auto-reconnect if you explicitly logged out
        if (reason !== DisconnectReason.loggedOut) {
            console.log(`┌─『 sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ 』\n│ 🔄 *ᴄᴏɴɴᴇᴄᴛɪᴏɴ_ʟᴏsᴛ*\n│ ⚙ ʀᴇᴀsᴏɴ_ᴄᴏᴅᴇ: ${reason || 'ᴜɴᴋɴᴏᴡɴ'}\n│ 🚀 *ᴀᴄᴛɪᴏɴ:* ʀᴇᴄᴏɴɴᴇᴄᴛɪɴɢ_ɪɴ_𝟹s...\n└────────────────────────┈`);
            
            setTimeout(() => {
                startVinnieHub();
            }, 3000);
        } else {
            console.log(`┌─『 sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ 』\n│ 🚪 *ʟᴏɢɢᴇᴅ_ᴏᴜᴛ*\n│ ⚙ ʟᴏɢ: sᴇssɪᴏɴ_ᴛᴇʀᴍɪɴᴀᴛᴇᴅ\n└────────────────────────┈`);
        }
    }
};

export default connectionHandler;
