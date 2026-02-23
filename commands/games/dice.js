module.exports = {
    name: "dice",
    category: "games",
    desc: "Bet against the bot in a dice roll",
    async execute(sock, msg, args, { from }) {
        const userBet = parseInt(args[0]);
        if (isNaN(userBet) || userBet < 1 || userBet > 6) {
            return sock.sendMessage(from, { text: "🎲 Usage: *.dice [1-6]*\nExample: .dice 4" });
        }

        const botRoll = Math.floor(Math.random() * 6) + 1;
        const userRoll = Math.floor(Math.random() * 6) + 1;
        
        const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
        
        let resultStatus = "";
        if (userRoll === userBet && userRoll > botRoll) {
            resultStatus = "🌟 *JACKPOT!* You guessed right AND beat me!";
        } else if (userRoll > botRoll) {
            resultStatus = "🎉 *YOU WIN!* Your roll was higher.";
        } else if (userRoll === botRoll) {
            resultStatus = "🤝 *DRAW!* We tied.";
        } else {
            resultStatus = "💀 *YOU LOST!* The house always wins.";
        }

        const response = `┏━━━━━ ✿ *V_HUB CASINO* ✿ ━━━━━┓
┃
┃  👤 *Your Bet:* ${userBet}
┃  👤 *Your Roll:* ${diceFaces[userRoll - 1]} (${userRoll})
┃  🤖 *Bot Roll:* ${diceFaces[botRoll - 1]} (${botRoll})
┃
┃  📢 *Result:* ┃  ${resultStatus}
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sock.sendMessage(from, { text: response }, { quoted: msg });
    }
};