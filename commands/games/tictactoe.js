module.exports = {
    name: "ttt",
    category: "games",
    desc: "Play TicTacToe against the bot",
    async execute(sock, msg, args, { from }) {
        // 1. Check if a game is already running in this chat
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { text: "❌ A game is already active in this chat! Finish it first." });
        }

        // 2. Initialize the Game State
        const gameData = {
            name: "ttt",
            board: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            player: msg.key.participant || from,
            turn: "PLAYER", // PLAYER starts first
            winner: null
        };

        global.gamestate.set(from, gameData);

        const renderBoard = (b) => {
            return `┏━━━━━ ✿ *TIC-TAC-TOE* ✿ ━━━━━┓\n┃\n┃      ${b[0]}  |  ${b[1]}  |  ${b[2]}\n┃     ──┼───┼──\n┃      ${b[3]}  |  ${b[4]}  |  ${b[5]}\n┃     ──┼───┼──\n┃      ${b[6]}  |  ${b[7]}  |  ${b[8]}\n┃\n┃  👤 *Your Turn:* Type a number (1-9)\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
        };

        await sock.sendMessage(from, { text: renderBoard(gameData.board) });
    },

    // 🕹️ This is called by the interceptor in index.js
    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const player = msg.key.participant || from;

        // Security: Only the person who started the game can move
        if (player !== game.player) return;

        const move = parseInt(text) - 1;
        if (isNaN(move) || move < 0 || move > 8 || game.board[move] === 'X' || game.board[move] === 'O') {
            return; // Ignore invalid moves silently
        }

        // 1. Player Move (X)
        game.board[move] = '❌';
        
        if (checkWin(game.board)) {
            await sock.sendMessage(from, { text: `🎉 *CONGRATULATIONS!* You beat the bot!\n\n${drawBoard(game.board)}` });
            return global.gamestate.delete(from);
        }

        if (game.board.every(s => s === '❌' || s === '⭕')) {
            await sock.sendMessage(from, { text: `🤝 *DRAW!* Good game.\n\n${drawBoard(game.board)}` });
            return global.gamestate.delete(from);
        }

        // 2. Bot Move (O) - Basic AI: Picks first available spot
        const availableMoves = game.board.filter(s => s !== '❌' && s !== '⭕');
        const botMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        const botIndex = game.board.indexOf(botMove);
        game.board[botIndex] = '⭕';

        if (checkWin(game.board)) {
            await sock.sendMessage(from, { text: `💀 *DEFEAT!* V_HUB Bot wins again.\n\n${drawBoard(game.board)}` });
            return global.gamestate.delete(from);
        }

        // 3. Update the chat with the new board
        await sock.sendMessage(from, { text: drawBoard(game.board) });
    }
};

// --- 🛠️ Helper Functions ---

function drawBoard(b) {
    return `┏━━━━━ ✿ *TIC-TAC-TOE* ✿ ━━━━━┓\n┃\n┃      ${b[0]}  |  ${b[1]}  |  ${b[2]}\n┃     ──┼───┼──\n┃      ${b[3]}  |  ${b[4]}  |  ${b[5]}\n┃     ──┼───┼──\n┃      ${b[6]}  |  ${b[7]}  |  ${b[8]}\n┃\n┃  🎮 *Status:* Game in progress...\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
}

function checkWin(b) {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    return wins.some(w => b[w[0]] === b[w[1]] && b[w[0]] === b[w[2]]);
}