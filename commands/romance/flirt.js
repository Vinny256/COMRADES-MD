const flirtCommand = {
    name: "flirt",
    category: "romance",
    desc: "Get a high-quality flirtatious line or rizz",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "✨", key: msg.key } });
        
        // 1. Show "Typing..." to create anticipation
        await sock.sendPresenceUpdate('composing', from); 

        try {
            // 2. Fetch from the Flirt/Rizz API
            const response = await fetch('https://vinay-sunil.vercel.app/api/rizz');
            
            if (!response.ok) throw new Error("API_OFFLINE");
            const data = await response.json();
            
            const flirtLine = data.rizz || "ɪғ ʙᴇɪɴɢ ʙᴇᴀᴜᴛɪғᴜʟ ᴡᴀs ᴀ ᴄʀɪᴍᴇ, ʏᴏᴜ’ᴅ ʙᴇ sᴇʀᴠɪɴɢ ᴀ ʟɪғᴇ sᴇɴᴛᴇɴᴄᴇ. 😉";

            // --- 📑 ROMANCE UI CONSTRUCTION ---
            let flirtMsg = `┌────────────────────────┈\n`;
            flirtMsg += `│      *ᴠ-ʜᴜʙ_ʀᴏᴍᴀɴᴄᴇ_ʟᴏɢ* \n`;
            flirtMsg += `└────────────────────────┈\n\n`;
            
            flirtMsg += `┌─『 ʀɪᴢᴢ_ɪɴsɪɢʜᴛ 』\n`;
            flirtMsg += `│ ✨ *ᴛʜᴇ_ᴠɪʙᴇ:* ${flirtLine}\n`;
            flirtMsg += `│ 👤 *ᴛᴏ:* @${from.split('@')[0]}\n`;
            flirtMsg += `│ 📡 *sᴛᴀᴛᴜs:* ᴄᴏɴɴᴇᴄᴛɪᴏɴ_ʟɪᴠᴇ\n`;
            flirtMsg += `└────────────────────────┈\n\n`;
            
            flirtMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // 4. Send the message with mentions and a quote
            await sock.sendMessage(from, { 
                text: flirtMsg, 
                mentions: [from] 
            }, { quoted: msg });

            // 5. Read After Reply (GB Style Elite)
            await sock.readMessages([msg.key]);

        } catch (e) {
            // --- 🛡️ ELITE FALLBACK SYSTEM ---
            const rizzArchive = [
                "Are you a Wi-Fi signal? Because I'm feeling a really strong connection.",
                "Is it hot in here, or is it just the sparks between us?",
                "I’m not a photographer, but I can definitely picture us together.",
                "Do you have a map? I just got lost in your eyes. 🗺️"
            ];
            const fallback = rizzArchive[Math.floor(Math.random() * rizzArchive.length)];

            let errorMsg = `┌────────────────────────┈\n`;
            errorMsg += `│      *ᴠ-ʜᴜʙ_ʀᴏᴍᴀɴᴄᴇ_ʟᴏɢ* \n`;
            errorMsg += `└────────────────────────┈\n\n`;
            errorMsg += `┌─『 ʀɪᴢᴢ_ᴏғғʟɪɴᴇ 』\n`;
            errorMsg += `│ ✨ *ᴠɪʙᴇ:* ${fallback}\n`;
            errorMsg += `│ ⚙ *sᴛᴀᴛᴜs:* ғᴀɪʟsᴀғᴇ_ᴍᴏᴅᴇ\n`;
            errorMsg += `└────────────────────────┈\n`;

            await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        }
    }
};

export default flirtCommand;
