const crushieCommand = {
    name: "crushie",
    category: "romance",
    desc: "Get a flirty pick-up line or tech-romance joke",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "💘", key: msg.key } });
        await sock.sendPresenceUpdate('composing', from); 

        try {
            // --- 🚀 FETCH SCRIPT ---
            const response = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
            
            // 🛡️ CONTENT-TYPE GUARD
            if (!response.ok) throw new Error("API_OFFLINE");
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) throw new Error("NON_JSON_RESPONSE");

            const data = await response.json();
            const pickupLine = `${data[0].setup} ... ${data[0].punchline}`;

            // --- 📑 ROMANCE UI CONSTRUCTION ---
            let romanceMsg = `┌────────────────────────┈\n`;
            romanceMsg += `│      *ᴠ-ʜᴜʙ_ʀᴏᴍᴀɴᴄᴇ_ʟᴏɢ* \n`;
            romanceMsg += `└────────────────────────┈\n\n`;
            
            romanceMsg += `┌─『 ᴄʀᴜsʜɪᴇ_ɪɴsɪɢʜᴛ 』\n`;
            romanceMsg += `│ 💘 *ᴍsɢ:* ${pickupLine}\n`;
            romanceMsg += `│ 👤 *ᴛᴏ:* @${from.split('@')[0]}\n`;
            romanceMsg += `│ ⚙ *sᴛᴀᴛᴜs:* ᴏɴʟɪɴᴇ_ʟɪᴠᴇ 📡\n`;
            romanceMsg += `└────────────────────────┈\n\n`;
            
            romanceMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: romanceMsg, 
                mentions: [from] 
            }, { quoted: msg });

        } catch (e) {
            // --- 🛡️ ELITE FALLBACK SYSTEM ---
            const fallbacks = [
                "Are you a keyboard? Because you're just my type. 😉",
                "Is your name Google? Because you have everything I’m searching for.",
                "Are you an exception? Because I'd like to catch you. 💎",
                "My love for you is like a backlink... it only grows stronger over time."
            ];
            const fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

            let errorMsg = `┌────────────────────────┈\n`;
            errorMsg += `│      *ᴠ-ʜᴜʙ_ʀᴏᴍᴀɴᴄᴇ_ʟᴏɢ* \n`;
            errorMsg += `└────────────────────────┈\n\n`;
            errorMsg += `┌─『 ᴄʀᴜsʜɪᴇ_ᴏғғʟɪɴᴇ 』\n`;
            errorMsg += `│ 💘 *ᴍsɢ:* ${fallback}\n`;
            errorMsg += `│ 📡 *sᴛᴀᴛᴜs:* ғᴀɪʟsᴀғᴇ_ᴍᴏᴅᴇ\n`;
            errorMsg += `└────────────────────────┈\n`;

            await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        }
    }
};

export default crushieCommand;
