const axios = require('axios');

module.exports = {
    name: "wcg",
    category: "games",
    desc: "PvP Word Chain Survival (15s Turn)",
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
            requiredWords: 3, 
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
            const currentGame = global.gamestate.get(from);
            if (currentGame && currentGame.status === "WAITING") {
                if (currentGame.players.length < 2) {
                    global.gamestate.delete(from);
                    await sock.sendMessage(from, { text: "❌ Game cancelled: Not enough players joined." });
                } else {
                    startGame(sock, from, currentGame);
                }
            }
        }, 60000);
    },

    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const input = text.trim().toUpperCase();

        // --- JOIN LOGIC (Any Case) ---
        if (game.status === "WAITING" && input === "JOIN") {
            if (game.players.includes(sender)) return;
            
            game.players.push(sender);
            const pName = msg.pushName || `Player ${game.players.length}`;
            game.playerNames.push(pName);
            game.scores[sender] = 0;
            
            return sock.sendMessage(from, { text: `✅ *${pName}* joined the arena!` });
        }

        // --- GAMEPLAY LOGIC ---
        if (game.status === "PLAYING") {
            const currentPlayer = game.players[game.currentTurn];
            if (sender !== currentPlayer) return;

            // 1. Check First Letter
            if (game.lastLetter && input[0] !== game.lastLetter) {
                return sock.sendMessage(from, { text: `❌ Must start with letter *"${game.lastLetter}"*!` });
            }

            // 2. Check if already used
            if (game.usedWords.includes(input)) {
                return sock.sendMessage(from, { text: `❌ *"${input}"* has already been used!` });
            }

            // 3. Dictionary Check
            try {
                const isReal = await checkWord(input);
                if (!isReal) {
                    return sock.sendMessage(from, { text: `❌ *"${input}"* is not a valid English word!` });
                }

                // --- VALID WORD LOGIC ---
                clearTimeout(game.timer);
                game.usedWords.push(input);
                game.lastLetter = input.slice(-1);
                game.currentWordCount++;
                game.scores[sender] += 10; 

                if (game.currentWordCount < game.requiredWords) {
                    const remaining = game.requiredWords - game.currentWordCount;
                    const prompt = `✅ *${input}* accepted!\n👉 Next starts with: *${game.lastLetter}*\n🔢 Words needed: *${remaining}*\n⏳ 15s left!`;
                    await sock.sendMessage(from, { text: prompt });
                    
                    startTurnTimer(sock, from, game);
                } else {
                    // Turn Complete - Pass to next player
                    game.currentWordCount = 0;
                    game.requiredWords++; // Level Up!
                    game.currentTurn = (game.currentTurn + 1) % game.players.length;
                    
                    const nextUser = game.playerNames[game.currentTurn];
                    const nextMsg = `🌟 *TURN COMPLETE!*\n\n👤 *Next:* ${nextUser}\n🎯 *Goal:* Name ${game.requiredWords} words\n👉 *Starting Letter:* ${game.lastLetter}\n⏳ 15s starts NOW!`;
                    await sock.sendMessage(from, { text: nextMsg });
                    
                    startTurnTimer(sock, from, game);
                }
            } catch (e) {
                console.log("Dictionary Error:", e);
            }
        }
    }
};

// --- HELPERS ---

async function checkWord(word) {
    try {
        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        return !!res.data[0];
    } catch { 
        return false; 
    }
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
        const currentGame = global.gamestate.get(from);
        if (!currentGame) return;

        const loser = currentGame.playerNames[currentGame.currentTurn];
        const winnerIndex = (currentGame.currentTurn === 0) ? 1 : 0;
        const winner = currentGame.playerNames[winnerIndex];
        const winScore = currentGame.scores[currentGame.players[winnerIndex]] || 0;

        const endMsg = `⏰ *TIME OUT!*\n\n💀 ${loser} failed to respond in 15s!\n🏆 *WINNER:* ${winner}\n💰 *Final Points:* ${winScore}\n\n_Game Over._`;
        
        await sock.sendMessage(from, { text: endMsg });
        global.gamestate.delete(from);
    }, 15000); 
}