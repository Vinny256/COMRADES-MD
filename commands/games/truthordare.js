const todaCommand = {
    name: "toda",
    category: "games",
    desc: "Classic Truth or Dare game",
    async execute(sock, msg, args, { from, prefix }) {
        const type = args[0]?.toLowerCase();

        const truths = [
            "What is your biggest fear in a relationship?",
            "What is the most embarrassing thing you've ever done?",
            "If you could be invisible for a day, what would you do?",
            "Have you ever lied to your best friend?",
            "What is the weirdest habit you have?",
            "Who is your secret crush in this group?",
            "What is the most childish thing you still do?",
            "Have you ever ghosted someone?",
            "What’s the most expensive thing you’ve ever stolen?"
        ];

        const dares = [
            "Send a voice note singing your favorite song.",
            "Text your ex 'I still miss you' and send a screenshot here.",
            "Change your WhatsApp bio to 'I am a potato' for 1 hour.",
            "Send the 5th photo in your gallery.",
            "Voice note yourself screaming like a goat.",
            "Send a message to your crush right now.",
            "Describe the person you like using only emojis.",
            "Do 20 pushups and record the audio of you panting.",
            "Tell the group a secret you've never told anyone."
        ];

        if (type === 'truth') {
            const randomTruth = truths[Math.floor(Math.random() * truths.length)];
            let truthMsg = `┌────────────────────────┈\n`;
            truthMsg += `│      *ᴠ-ʜᴜʙ_ᴛʀᴜᴛʜ* \n`;
            truthMsg += `└────────────────────────┈\n\n`;
            truthMsg += `┌─『 sᴏᴄɪᴀʟ_ᴇxᴘᴏsᴜʀᴇ 』\n`;
            truthMsg += `│ 🤔 *ǫᴜᴇsᴛɪᴏɴ:* \n`;
            truthMsg += `│ 👉 ${randomTruth}\n`;
            truthMsg += `└────────────────────────┈\n\n`;
            truthMsg += `_ᴀɴsᴡᴇʀ ʜᴏɴᴇsᴛʟʏ ᴏʀ ʙᴇ ᴘᴜʀɢᴇᴅ._`;

            await sock.sendMessage(from, { text: truthMsg }, { quoted: msg });

        } else if (type === 'dare') {
            const randomDare = dares[Math.floor(Math.random() * dares.length)];
            let dareMsg = `┌────────────────────────┈\n`;
            dareMsg += `│      *ᴠ-ʜᴜʙ_ᴅᴀʀᴇ* \n`;
            dareMsg += `└────────────────────────┈\n\n`;
            dareMsg += `┌─『 ᴄʜᴀʟʟᴇɴɢᴇ_ᴀᴄᴛɪᴠᴇ 』\n`;
            dareMsg += `│ 🔥 *ᴛᴀsᴋ:* \n`;
            dareMsg += `│ 👉 ${randomDare}\n`;
            dareMsg += `└────────────────────────┈\n\n`;
            dareMsg += `_ɴᴏ ʙᴀᴄᴋɪɴɢ ᴏᴜᴛ ɴᴏᴡ._`;

            await sock.sendMessage(from, { text: dareMsg }, { quoted: msg });

        } else {
            let menu = `┌────────────────────────┈\n`;
            menu += `│      *ᴛʀᴜᴛʜ_ᴏʀ_ᴅᴀʀᴇ* \n`;
            menu += `└────────────────────────┈\n\n`;
            menu += `┌─『 ᴄʜᴏᴏsᴇ_ʏᴏᴜʀ_ғᴀᴛᴇ 』\n`;
            menu += `│ ⚙ *ᴏᴘᴛ𝟷:* ${prefix}ᴛᴏᴅᴀ ᴛʀᴜᴛʜ\n`;
            menu += `│ ⚙ *ᴏᴘᴛ𝟸:* ${prefix}ᴛᴏᴅᴀ ᴅᴀʀᴇ\n`;
            menu += `└────────────────────────┈\n\n`;
            menu += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: menu }, { quoted: msg });
        }
    }
};

export default todaCommand;
