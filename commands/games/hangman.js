module.exports = {
    name: "hangman",
    category: "games",
    desc: "Guess the word letter by letter",
    async execute(sock, msg, args, { from }) {
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { text: "❌ A game is already active!" });
        }

        const words = ["GALAXY", "PROGRAM", "VINNIE", "WHATSAPP", "VALORANT", "NETFLIX", "AVENGER"];
        const target = words[Math.floor(Math.random() * words.length)];
        
        const gameData = {
            name: "hangman",
            word: target,
            guessed: [],
            lives: 6
        };

        global.gamestate.set(from, gameData);
        await sock.sendMessage(from, { text: renderHangman(gameData) });
    },

    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const letter = text.trim().toUpperCase();

        if (letter.length !== 1 || game.guessed.includes(letter)) return;

        game.guessed.push(letter);

        if (!game.word.includes(letter)) {
            game.lives--;
        }

        const isWin = game.word.split('').every(char => game.guessed.includes(char));

        if (isWin) {
            await sock.sendMessage(from, { text: `🎉 *VICTORY!* You guessed the word: *${game.word}*\n\n${renderHangman(game)}` });
            return global.gamestate.delete(from);
        }

        if (game.lives <= 0) {
            await sock.sendMessage(from, { text: `💀 *GAME OVER!* The word was: *${game.word}*\n\n${renderHangman(game)}` });
            return global.gamestate.delete(from);
        }

        await sock.sendMessage(from, { text: renderHangman(game) });
    }
};

function renderHangman(game) {
    const stages = ["💀", "🪂", "🦶", "🦵", "💪", "🦾", "🏠"]; // Simplified hangman logic
    const displayWord = game.word.split('').map(char => game.guessed.includes(char) ? char : "_").join(" ");
    
    return `┏━━━━━ ✿ *HANGMAN* ✿ ━━━━━┓\n┃\n┃  ❤️ Lives: ${"❤️".repeat(game.lives)}\n┃  🧩 Word: ${displayWord}\n┃  🚫 Misses: [${game.guessed.filter(l => !game.word.includes(l))}]\n┃\n┃  👉 *Type one letter!*\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
}