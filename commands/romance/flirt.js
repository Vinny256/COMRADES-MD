module.exports = {
    name: "flirt",
    category: "romance",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        try {
            // 1. Show "Typing..." to create anticipation
            await sock.sendPresenceUpdate('composing', from); 

            // 2. Fetch from the Flirt/Rizz API
            // Using a reliable endpoint for higher-quality flirtatious lines
            const response = await fetch('https://vinay-sunil.vercel.app/api/rizz');
            const data = await response.json();
            
            // Fallback line in case the API has a hiccup
            const flirtLine = data.rizz || "If being beautiful was a crime, you’d be serving a life sentence. 😉";

            // 3. V_HUB Styling (Elegant Romance Theme)
            const vHubMessage = `╭─── ~✾~ *V_HUB ROMANCE* ~✾~ ───\n` +
                               `│\n` +
                               `│ ✨ *The Vibe:* ${flirtLine}\n` +
                               `│ 👤 *To:* @${from.split('@')[0]}\n` +
                               `│ 📡 *Status:* Connection Established\n` +
                               `│\n` +
                               `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

            // 4. Send the message with mentions and a quote
            await sock.sendMessage(from, { 
                text: vHubMessage,
                mentions: [from] 
            }, { quoted: msg });

            // 5. Read After Reply (Your requested GB feature)
            await sock.readMessages([msg.key]);

        } catch (e) {
            console.error("Flirt API Error:", e);
            await sock.sendMessage(from, { text: "❌ *V_HUB:* Even my AI is speechless at your beauty (or the API is down)." }, { quoted: msg });
        }
    }
};
