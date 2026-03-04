module.exports = {
    name: "crushie",
    category: "romance",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        try {
            await sock.sendPresenceUpdate('composing', from); 

            // Use a different, more stable API (Official Jokes API with 'flattery' type)
            const response = await fetch('https://official-joke-api.appspot.com/jokes/programming/random');
            
            // 🛑 THE CRITICAL CHECK: If it's not JSON, don't try to parse it!
            if (!response.ok) throw new Error("API is acting up");
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Received HTML instead of JSON");
            }

            const data = await response.json();
            
            // Since this is a joke API, we'll format it:
            const pickupLine = `${data[0].setup} ... ${data[0].punchline}`;

            const vHubMessage = `╭─── ~✾~ *V_HUB ROMANCE* ~✾~ ───\n` +
                               `│\n` +
                               `│ 💘 *Crushie:* ${pickupLine}\n` +
                               `│ 👤 *To:* @${from.split('@')[0]}\n` +
                               `│\n` +
                               `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

            await sock.sendMessage(from, { text: vHubMessage, mentions: [from] }, { quoted: msg });
            await sock.readMessages([msg.key]);

        } catch (e) {
            console.log("Error details:", e.message);
            // Fallback: If the API breaks, send a hardcoded line so the bot stays "Online"
            const fallback = "Are you a keyboard? Because you're just my type. 😉";
            await sock.sendMessage(from, { text: `╭─── ~✾~ *V_HUB ROMANCE* ~✾~ ───\n│\n│ 💘 ${fallback}\n│ 📡 *Status:* Offline Mode\n╰─── ~✾~` }, { quoted: msg });
        }
    }
};
