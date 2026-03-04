module.exports = {
    name: "crushie",
    category: "romance",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        try {
            // 1. "God Mode" Simulation (Specific to this chat)
            await sock.sendPresenceUpdate('composing', from); 

            // 2. Fetch from Public API
            const response = await fetch('https://rizz-api.vercel.app/api/random');
            const data = await response.json();
            const pickupLine = data.text || "Are you a magician? Because whenever I look at you, everyone else disappears. ✨";

            // 3. V_HUB Styling (Matches your Online command aesthetics)
            const vHubMessage = `╭─── ~✾~ *V_HUB ROMANCE* ~✾~ ───\n` +
                               `│\n` +
                               `│ 💘 *Line:* ${pickupLine}\n` +
                               `│ 👤 *Target:* @${from.split('@')[0]}\n` +
                               `│ 📡 *Status:* Rizz Delivered\n` +
                               `│\n` +
                               `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

            // 4. Send with Mention and Quote
            await sock.sendMessage(from, { 
                text: vHubMessage,
                mentions: [from] 
            }, { quoted: msg });

            // 5. Read After Reply (GB Style)
            // This ensures the blue tick only appears AFTER the bot flirts
            await sock.readMessages([msg.key]);

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: `❌ *V_HUB Error:* ${e.message}` }, { quoted: msg });
        }
    }
};
