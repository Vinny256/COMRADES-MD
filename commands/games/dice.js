const diceCommand = {
    name: "dice",
    category: "games",
    desc: "Bet against the bot in a dice roll",
    async execute(sock, msg, args, { from, prefix }) {
        const userBet = parseInt(args[0]);
        
        // 1. Validation Logic
        if (isNaN(userBet) || userBet < 1 || userBet > 6) {
            return sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* ${prefix}ᴅɪᴄᴇ [𝟷-𝟼]\n│ ⚙ *ᴇx:* ${prefix}ᴅɪᴄᴇ 𝟺\n└────────────────────────┈` 
            });
        }

        // 2. Execution Logic
        const botRoll = Math.floor(Math.random() * 6) + 1;
        const userRoll = Math.floor(Math.random() * 6) + 1;
        const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
        
        let resultStatus = "";
        let winColor = "⚪";

        if (userRoll === userBet && userRoll > botRoll) {
            resultStatus = "🌟 *ᴊᴀᴄᴋᴘᴏᴛ!* ʏᴏᴜ ɢᴜᴇssᴇᴅ ʀɪɢʜᴛ ᴀɴᴅ ʙᴇᴀᴛ ᴍᴇ!";
            winColor = "🟢";
        } else if (userRoll > botRoll) {
            resultStatus = "🎉 *ʏᴏᴜ ᴡɪɴ!* ʏᴏᴜʀ ʀᴏʟʟ ᴡᴀs ʜɪɢʜᴇʀ.";
            winColor = "🟢";
        } else if (userRoll === botRoll) {
            resultStatus = "🤝 *ᴅʀᴀᴡ!* ᴡᴇ ᴛɪᴇᴅ.";
            winColor = "🟡";
        } else {
            resultStatus = "💀 *ʏᴏᴜ ʟᴏsᴛ!* ᴛʜᴇ ʜᴏᴜsᴇ ᴀʟᴡᴀʏs ᴡɪɴs.";
            winColor = "🔴";
        }

        // 3. Premium UI Construction
        let diceMsg = `┌────────────────────────┈\n`;
        diceMsg += `│      *ᴠ-ʜᴜʙ_ᴄᴀsɪɴᴏ* \n`;
        diceMsg += `└────────────────────────┈\n\n`;
        
        diceMsg += `┌─『 ʀᴏʟʟ_ᴅᴇᴛᴀɪʟs 』\n`;
        diceMsg += `│ ⚙ *ʏᴏᴜʀ ʙᴇᴛ:* ${userBet}\n`;
        diceMsg += `│ 👤 *ʏᴏᴜʀ ʀᴏʟʟ:* ${diceFaces[userRoll - 1]} (${userRoll})\n`;
        diceMsg += `│ 🤖 *ʙᴏᴛ ʀᴏʟʟ:* ${diceFaces[botRoll - 1]} (${botRoll})\n`;
        diceMsg += `└────────────────────────┈\n\n`;
        
        diceMsg += `┌─『 ᴏᴜᴛᴄᴏᴍᴇ 』\n`;
        diceMsg += `│ ${winColor} ${resultStatus}\n`;
        diceMsg += `└────────────────────────┈\n\n`;
        
        diceMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

        await sock.sendMessage(from, { text: diceMsg }, { quoted: msg });
    }
};

export default diceCommand;
