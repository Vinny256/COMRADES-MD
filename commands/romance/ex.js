module.exports = {
    name: "ex",
    category: "romance",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        try {
            // 1. "God Mode" Simulation (Show the bot is "Recording" a voice note)
            await sock.sendPresenceUpdate('recording', from); 

            // 2. Fetch from a "Savage/Toxic" API 
            // Using a specific endpoint for 'evil' or 'burn' lines
            const response = await fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json');
            const data = await response.json();
            
            const savageLine = data.insult || "My ex asked me, 'Where have you been all my life?' I said, 'Hiding from you.' 💀";

            // 3. V_HUB Styling (Dark Theme for the Ex)
            const vHubMessage = `╭─── ~✾~ *V_HUB: THE EX-FILES* ~✾~ ───\n` +
                               `│\n` +
                               `│ 🥀 *The Burn:* ${savageLine}\n` +
                               `│ 👤 *Recipient:* @${from.split('@')[0]}\n` +
                               `│ 🛡️ *Status:* Savage Mode Active\n` +
                               `│\n` +
                               `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

            // 4. Send with Mention and Quote
            await sock.sendMessage(from, { 
                text: vHubMessage,
                mentions: [from] 
            }, { quoted: msg });

            // 5. Read After Reply (GB Style)
            await sock.readMessages([msg.key]);

        } catch (e) {
            console.error(e);
            // Fallback if the API is down
            await sock.sendMessage(from, { text: "❌ *V_HUB:* Even the API thinks your Ex isn't worth the effort." }, { quoted: msg });
        }
    }
};
