const axios = require('axios');

module.exports = {
    name: "wcg",
    category: "games",
    desc: "PvP Word Chain Survival",
    async execute(sock, msg, args, { from }) {
        if (global.gamestate.has(from)) return;

        const player1 = msg.key.participant || msg.key.remoteJid;
        const player1Name = msg.pushName || "Player 1";

        const gameData = {
            name: "wcg",
            status: "WAITING",
            players: [player1],
            playerNames: [player1Name],
            scores: { [player1]: 0 },
            currentTurn: 0,
            requiredWords: 3, // Starts with 3 words
            currentWordCount: 0,
            lastLetter: "",
            usedWords: [],
            timer: null
        };

        global.gamestate.set(from, gameData);

        const joinMsg = `┏━━━━━ ✿ *WCG SURVIVAL* ✿ ━━━━━┓\n┃\n┃  🎮 *Host:* ${player1Name}\n┃  🏆 *Mode:* PvP Survival\n┃\n┃  👉 *Type "join" to enter!*\n┃  ⏳ *Joining ends in:* 60s\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
        await sock.sendMessage(from, { text: joinMsg });

        // 1 Minute Join Timeout
        gameData.timer = setTimeout(async () => {
            if (gameData.status === "WAITING") {
                if (gameData.players.length < 2) {
                    global.gamestate.delete(from);
                    await sock.sendMessage(from, { text: "❌ Game cancelled: Not enough players." });
                } else {
                    startGame(sock, from, gameData);
                }
            }
        }, 60000);
    },

    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const input = text.trim().toUpperCase();

        // --- JOIN LOGIC ---
        if (game.status === "WAITING" && input === "JOIN") {
            if (game.players.includes(sender)) return;
            game.players.push(sender);
            game.playerNames.push(msg.pushName || "Player " + game.players.length);
            game.scores[sender] = 0;
            return sock.sendMessage(from, { text: `✅ ${msg.pushName} joined the arena!` });
        }

        // --- GAMEPLAY LOGIC ---
        if (game.status === "PLAYING") {
            const currentPlayer = game.players[game.currentTurn];
            if (sender !== currentPlayer) return;

            // 1. Check First Letter (if not the very first word of the game)
            if (game.lastLetter && input[0] !== game.lastLetter) return;

            // 2. Check if already used
            if (game.usedWords.includes(input)) {
                return sock.sendMessage(from, { text: "❌ Word already used!" });
            }

            // 3. Dictionary Check (English Only)
            try {
                const isReal = await checkWord(input);
                if (!isReal) return sock.sendMessage(from, { text: "❌ Not a valid English word!" });

                // Word is Valid!
                clearTimeout(game.timer);
                game.usedWords.push(input);
                game.lastLetter = input.slice(-1);
                game.currentWordCount++;
                game.scores[sender] += 10; // Earn 10 points per word

                if (game.currentWordCount < game.requiredWords) {
                    // Still need more words in this turn
                    const remaining = game.requiredWords - game.currentWordCount;
                    const prompt = `✅ *${input}* accepted!\n👉 Next word starts with: *${game.lastLetter}*\n🔢 Words remaining this turn: *${remaining}*\n⏳ 15s left!`;
                    await sock.sendMessage(from, { text: prompt });
                    
                    // Reset 15s timer for the same player
                    startTurnTimer(sock, from, game);
                } else {
                    // Turn Complete! Next Player
                    game.currentWordCount = 0;
                    game.requiredWords++; // Increase difficulty
                    game.currentTurn = (game.currentTurn + 1) % game.players.length;
                    
                    const nextUser = game.playerNames[game.currentTurn];
                    const nextMsg = `🌟 *TURN COMPLETE!*\n\n👤 *Next:* ${nextUser}\n🎯 *Goal:* Name ${game.requiredWords} words\n👉 *Starting Letter:* ${game.lastLetter}\n⏳ 15s starts NOW!`;
                    await sock.sendMessage(from, { text: nextMsg });
                    
                    startTurnTimer(sock, from, game);
                }
            } catch (e) { console.log("Dict Error"); }
        }
    }
};

// --- HELPERS ---

async function checkWord(word) {
    try {
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        return !!res.data[0];
    } catch { return false; }
}

function startGame(sock, from, game) {
    game.status = "PLAYING";
    const user = game.playerNames[0];
    const msg = `🚩 *GAME STARTING!*\n\n👤 *First Player:* ${user}\n🎯 *Goal:* Name ${game.requiredWords} words\n⏳ You have 15s per word!\n\n👉 *Type any English word to begin:*`;
    sock.sendMessage(from, { text: msg });
    startTurnTimer(sock, from, game);
}

function startTurnTimer(sock, from, game) {
    clearTimeout(game.timer);
    game.timer = setTimeout(async () => {
        const loser = game.playerNames[game.currentTurn];
        const winnerIndex = (game.currentTurn === 0) ? 1 : 0; // Simple logic for 2 players
        const winner = game.playerNames[winnerIndex];
        const winScore = game.scores[game.players[winnerIndex]];

        const endMsg = `⏰ *TIME OUT!*\n\n💀 ${loser} failed to respond!\n🏆 *WINNER:* ${winner}\n💰 *Points Earned:* ${winScore}\n\n_Game Over._`;
        await sock.sendMessage(from, { text: endMsg });
        global.gamestate.delete(from);
    }, 15000); // Strict 15 Seconds
}