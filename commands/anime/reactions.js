module.exports = {
    // 🚀 This Array makes them all "Different" commands in WhatsApp!
    name: ["hug", "slap", "pat", "kiss", "cuddle", "punch", "bite", "kill", "lick", "poke"],
    category: "anime",
    async execute(sock, msg, args, { prefix, from, command }) {
        
        try {
            // 1. "God Mode" Reaction: React with an emoji first
            await sock.sendMessage(from, { react: { text: "✨", key: msg.key } });

            // 2. Fetch the GIF from a stable Anime API (Waifu.pics)
            // We use the 'command' variable so the API knows if you want a hug or a slap!
            const response = await fetch(`https://api.waifu.pics/sfw/${command}`);
            
            // 🛡️ Guardian Logic: Check if it's actually JSON
            if (!response.ok) throw new Error("API Down");
            const data = await response.json();

            // 3. Who is getting the action?
            const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = mentioned ? `@${mentioned.split('@')[0]}` : "everyone";

            // 4. V_HUB Styling
            const vHubMessage = `╭─── ~✾~ *V_HUB ANIME* ~✾~ ───\n` +
                               `│\n` +
                               `│ 🎭 *Action:* ${command.toUpperCase()}\n` +
                               `│ 👤 *Target:* ${target}\n` +
                               `│ ✨ *Vibe:* Pure Emotion\n` +
                               `│\n` +
                               `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

            // 5. Send as a GIF (video with gifPlayback)
            await sock.sendMessage(from, { 
                video: { url: data.url }, 
                caption: vHubMessage,
                gifPlayback: true,
                mentions: mentioned ? [mentioned] : []
            }, { quoted: msg });

            // 6. Read Message (GB Style)
            await sock.readMessages([msg.key]);

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: `❌ *V_HUB:* The anime server is shy right now. Try again!` }, { quoted: msg });
        }
    }
};
