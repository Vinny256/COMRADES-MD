const exCommand = {
    name: "ex",
    category: "romance",
    desc: "Get a savage burn or toxic line for the ex",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🥀", key: msg.key } });
        
        // 1. "God Mode" Simulation (Recording status for psychological effect)
        await sock.sendPresenceUpdate('recording', from); 

        try {
            // 2. Fetch from Savage API
            const response = await fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json');
            
            if (!response.ok) throw new Error("API_OFFLINE");
            const data = await response.json();
            const savageLine = data.insult;

            // --- 📑 SAVAGE UI CONSTRUCTION ---
            let exMsg = `┌────────────────────────┈\n`;
            exMsg += `│      *ᴠ-ʜᴜʙ_ᴛʜᴇ_ᴇx-ғɪʟᴇs* \n`;
            exMsg += `└────────────────────────┈\n\n`;
            
            exMsg += `┌─『 sᴀᴠᴀɢᴇ_ʙᴜʀɴ 』\n`;
            exMsg += `│ 🥀 *ᴛʜᴇ_ʙᴜʀɴ:* ${savageLine}\n`;
            exMsg += `│ 👤 *ᴛᴀʀɢᴇᴛ:* @${from.split('@')[0]}\n`;
            exMsg += `│ 🛡️ *sᴛᴀᴛᴜs:* sᴀᴠᴀɢᴇ_ᴍᴏᴅᴇ_ʟɪᴠᴇ\n`;
            exMsg += `└────────────────────────┈\n\n`;
            
            exMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // 4. Send with Mention and Quote
            await sock.sendMessage(from, { 
                text: exMsg, 
                mentions: [from] 
            }, { quoted: msg });

            // 5. Mark as Read (GB Style Elite)
            await sock.readMessages([msg.key]);

        } catch (e) {
            // --- 🛡️ ELITE FALLBACK SYSTEM ---
            const toxicity = [
                "My ex asked me, 'Where have you been all my life?' I said, 'Hiding from you.' 💀",
                "Calling your ex is like re-reading a book where you already know the ending is trash.",
                "My ex is a living proof that I can survive anything, even bad taste.",
                "If my ex was on fire and I had a glass of water, I'd drink it. 🥂"
            ];
            const fallback = toxicity[Math.floor(Math.random() * toxicity.length)];

            let errorMsg = `┌────────────────────────┈\n`;
            errorMsg += `│      *ᴠ-ʜᴜʙ_ᴛʜᴇ_ᴇx-ғɪʟᴇs* \n`;
            errorMsg += `└────────────────────────┈\n\n`;
            errorMsg += `┌─『 sᴀᴠᴀɢᴇ_ᴏғғʟɪɴᴇ 』\n`;
            errorMsg += `│ 🥀 *ʙᴜʀɴ:* ${fallback}\n`;
            errorMsg += `│ ⚙ *sᴛᴀᴛᴜs:* ғᴀɪʟsᴀғᴇ_ᴍᴏᴅᴇ\n`;
            errorMsg += `└────────────────────────┈\n`;

            await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        }
    }
};

export default exCommand;
