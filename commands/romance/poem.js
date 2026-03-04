module.exports = {
    name: "poem",
    category: "romance",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        try {
            // 1. Show "Typing..." so they know the bot is "writing"
            await sock.sendPresenceUpdate('composing', from); 

            // 2. Fetch a random poem from PoetryDB
            // We ask for 1 random poem
            const response = await fetch('https://poetrydb.org/random/1');
            const data = await response.json();
            
            // PoetryDB returns an array, so we take the first item [0]
            const poem = data[0];
            const title = poem.title;
            const author = poem.author;
            
            // 3. Limit the length (Max 15 lines) so it stays readable on WhatsApp
            const lines = poem.lines.slice(0, 15).join('\n');
            const footer = poem.lines.length > 15 ? "... (Check full version online)" : "";

            // 4. V_HUB Styling
            const vHubMessage = `╭─── ~✾~ *V_HUB POETRY* ~✾~ ───\n` +
                               `│\n` +
                               `│ 📖 *Title:* ${title}\n` +
                               `│ ✍️ *Author:* ${author}\n` +
                               `│\n` +
                               `│ ${lines}\n` +
                               `│ ${footer}\n` +
                               `│\n` +
                               `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

            // 5. Send with Mention and Quote
            await sock.sendMessage(from, { 
                text: vHubMessage,
                mentions: [from] 
            }, { quoted: msg });

            // 6. Read After Reply (GB Style)
            await sock.readMessages([msg.key]);

        } catch (e) {
            console.error("Poetry API Error:", e);
            await sock.sendMessage(from, { 
                text: "❌ *V_HUB Error:* The library is closed. (API failed)" 
            }, { quoted: msg });
        }
    }
};
