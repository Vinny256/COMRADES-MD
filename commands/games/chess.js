module.exports = {
    name: "chess",
    category: "games",
    desc: "Play Chess vs Bot or a Friend",
    async execute(sock, msg, args, { from, prefix }) {
        if (global.gamestate.has(from)) return sock.sendMessage(from, { text: "❌ A game is already active here." });

        const player1 = msg.key.participant || msg.key.remoteJid;
        const player1Name = msg.pushName || "Player 1";

        // Initial setup - Asking for mode
        const modeMsg = `╭─── ~✾~ *V_HUB CHESS* ~✾~ ───\n` +
                        `│\n` +
                        `│ ✨ *Welcome, ${player1Name}*\n` +
                        `│\n` +
                        `│ 🤖 *Option 1:* Play vs BOT\n` +
                        `│ 👥 *Option 2:* Play vs FRIEND\n` +
                        `│\n` +
                        `│ 👉 *Reply with "bot" or "friend"* \n` +
                        `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

        const gameData = {
            name: "chess",
            status: "SELECTING_MODE",
            players: [player1],
            playerNames: [player1Name],
            mode: null,
            turn: player1,
            board: [
                ['♜','♞','♝','♛','♚','♝','♞','♜'],
                ['♟','♟','♟','♟','♟','♟','♟','♟'],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                [' ',' ',' ',' ',' ',' ',' ',' '],
                ['♙','♙','♙','♙','♙','♙','♙','♙'],
                ['♖','♘','♗','♕','♔','♗','♘','♖']
            ]
        };

        global.gamestate.set(from, gameData);
        await sock.sendMessage(from, { text: modeMsg });
    },

    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || from;
        const input = text.trim().toLowerCase();

        // 1. SELECT MODE
        if (game.status === "SELECTING_MODE") {
            if (sender !== game.players[0]) return;

            if (input === "bot") {
                game.mode = "BOT";
                game.playerNames.push("V_HUB AI 🤖");
                game.players.push("bot_id");
                game.status = "PLAYING";
                await sock.sendMessage(from, { text: "🤖 *Bot Mode Activated!* Good luck." });
                return renderBoard(sock, from, game);
            } 
            
            if (input === "friend") {
                game.mode = "FRIEND";
                game.status = "WAITING";
                await sock.sendMessage(from, { text: "⏳ *Waiting for friend...* Type *'join'* to enter! (1 min left)" });
                
                // 1 Minute Join Timer
                game.timer = setTimeout(async () => {
                    if (global.gamestate.get(from)?.status === "WAITING") {
                        global.gamestate.delete(from);
                        await sock.sendMessage(from, { text: "⏰ *V_HUB:* Friend didn't join in time. Game cancelled." });
                    }
                }, 60000);
                return;
            }
        }

        // 2. JOIN LOGIC (Friend Mode)
        if (game.status === "WAITING" && input === "join") {
            if (sender === game.players[0]) return;
            clearTimeout(game.timer);
            game.players.push(sender);
            game.playerNames.push(msg.pushName || "Friend");
            game.status = "PLAYING";
            await sock.sendMessage(from, { text: `✅ *${game.playerNames[1]}* joined!` });
            return renderBoard(sock, from, game);
        }

        // 3. MOVE LOGIC
        if (game.status === "PLAYING") {
            if (sender !== game.turn) return;

            // Pattern: a2 a4
            const movePattern = /^[a-h][1-8]\s[a-h][1-8]$/;
            if (!movePattern.test(input)) return;

            const [fromPos, toPos] = input.split(' ');
            const moved = updateBoard(game, fromPos, toPos);

            if (moved) {
                game.turn = game.players.find(p => p !== sender);
                await renderBoard(sock, from, game);

                // BOT'S TURN LOGIC
                if (game.mode === "BOT" && game.turn === "bot_id") {
                    await sock.sendPresenceUpdate('composing', from);
                    setTimeout(() => {
                        makeBotMove(game);
                        game.turn = game.players[0];
                        renderBoard(sock, from, game);
                    }, 2000);
                }
            }
        }
    }
};

// --- HELPERS ---

function updateBoard(game, fromPos, toPos) {
    const colMap = {a:0, b:1, c:2, d:3, e:4, f:5, g:6, h:7};
    const startX = 8 - parseInt(fromPos[1]);
    const startY = colMap[fromPos[0]];
    const endX = 8 - parseInt(toPos[1]);
    const endY = colMap[toPos[0]];

    const piece = game.board[startX][startY];
    if (piece === ' ') return false;

    game.board[endX][endY] = piece;
    game.board[startX][startY] = ' ';
    return true;
}

function makeBotMove(game) {
    // Simple AI: Moves a random pawn/piece it finds
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (['♟','♜','♞','♝','♛','♚'].includes(game.board[i][j])) {
                if (i < 7 && game.board[i+1][j] === ' ') {
                    game.board[i+1][j] = game.board[i][j];
                    game.board[i][j] = ' ';
                    return;
                }
            }
        }
    }
}

function renderBoard(sock, from, game) {
    let boardStr = `╭─── ~✾~ *CHESS BOARD* ~✾~ ───\n│\n`;
    boardStr += `│    a  b  c  d  e  f  g  h\n`;
    game.board.forEach((row, i) => {
        boardStr += `│ ${8 - i} ${row.join(' ')} ${8 - i}\n`;
    });
    boardStr += `│    a  b  c  d  e  f  g  h\n│\n`;
    const currentName = game.turn === game.players[0] ? game.playerNames[0] : game.playerNames[1];
    boardStr += `│ 🎮 *Turn:* ${currentName}\n`;
    boardStr += `│ 📝 *Move:* "a2 a4"\n`;
    boardStr += `╰─── ~✾~ *V_HUB GAMES* ~✾~ ───`;

    return sock.sendMessage(from, { text: boardStr });
}
