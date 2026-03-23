const poemCommand = {
    name: "poem",
    category: "romance",
    desc: "Fetch a random literary poem",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "📖", key: msg.key } });
        
        // 1. Show "Typing..." to simulate the bot "composing" the verse
        await sock.sendPresenceUpdate('composing', from); 

        try {
            // 2. Fetch from PoetryDB (1 Random Poem)
            const response = await fetch('https://poetrydb.org/random/1');
            
            if (!response.ok) throw new Error("API_OFFLINE");
            const data = await response.json();
            
            const poem = data[0];
            const title = poem.title;
            const author = poem.author;
            
            // 3. WhatsApp Formatting & Length Control (Limit to 15 lines)
            const lines = poem.lines.slice(0, 15).join('\n');
            const footerText = poem.lines.length > 15 ? "│ ... (ᴛᴇxᴛ_ᴛʀᴜɴᴄᴀᴛᴇᴅ)" : "";

            // --- 📑 POETRY UI CONSTRUCTION ---
            let poemMsg = `┌────────────────────────┈\n`;
            poemMsg += `│      *ᴠ-ʜᴜʙ_ʟɪᴛᴇʀᴀʀʏ_ʟᴏɢ* \n`;
            poemMsg += `└────────────────────────┈\n\n`;
            
            poemMsg += `┌─『 ᴘᴏᴇᴛɪᴄ_ɪɴsɪɢʜᴛ 』\n`;
            poemMsg += `│ 📖 *ᴛɪᴛʟᴇ:* ${title}\n`;
            poemMsg += `│ ✍️ *ᴀᴜᴛʜᴏʀ:* ${author}\n`;
            poemMsg += `│ ┈┈┈┈┈┈┈┈┈┈┈┈┈\n`;
            poemMsg += `│ \n`;
            
            // Map lines to include the side-border for professional look
            poem.lines.slice(0, 15).forEach(line => {
                poemMsg += `│ ${line}\n`;
            });

            if (footerText) poemMsg += `${footerText}\n`;
            
            poemMsg += `│ \n`;
            poemMsg += `└────────────────────────┈\n\n`;
            
            poemMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            // 4. Send with Mention and Quote
            await sock.sendMessage(from, { 
                text: poemMsg, 
                mentions: [from] 
            }, { quoted: msg });

            // 5. Read After Reply (GB Style Elite)
            await sock.readMessages([msg.key]);

        } catch (e) {
            // --- 🛡️ ELITE FALLBACK SYSTEM ---
            const fallbackPoem = "Roses are red,\nYour code is blue,\nIf I was an AI,\nI'd still prompt for you. 🌹";

            let errorMsg = `┌────────────────────────┈\n`;
            errorMsg += `│      *ᴠ-ʜᴜʙ_ʟɪᴛᴇʀᴀʀʏ_ʟᴏɢ* \n`;
            errorMsg += `└────────────────────────┈\n\n`;
            errorMsg += `┌─『 sʏsᴛᴇᴍ_ғᴀɪʟsᴀғᴇ 』\n`;
            errorMsg += `│ ${fallbackPoem}\n`;
            errorMsg += `│ ⚙ *sᴛᴀᴛᴜs:* ᴏғғʟɪɴᴇ_ᴍᴏᴅᴇ\n`;
            errorMsg += `└────────────────────────┈\n`;

            await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        }
    }
};

export default poemCommand;
