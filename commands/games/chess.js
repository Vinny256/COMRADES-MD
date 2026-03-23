const chessCommand = {
    name: "chess",
    category: "games",
    desc: "Play Chess vs Bot or a Friend",
    async execute(sock, msg, args, { from, prefix }) {
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ_ᴀʟᴇʀᴛ 』\n│ ⚙ ᴀ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ.\n└────────────────────────┈` 
            });
        }

        const player1 = msg.key.participant || msg.key.remoteJid;
        const player1Name = msg.pushName || "ᴘʟᴀʏᴇʀ_𝟷";

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

        let modeMsg = `┌────────────────────────┈\n`;
        modeMsg += `│      *ᴠ-ʜᴜʙ_ᴄʜᴇss* \n`;
        modeMsg += `└────────────────────────┈\n\n`;
        modeMsg += `┌─『 ɢᴀᴍᴇ_ɪɴɪᴛ 』\n`;
        modeMsg += `│ ✨ *ᴡᴇʟᴄᴏᴍᴇ:* ${player1Name}\n`;
        modeMsg += `│ 🤖 *ᴏᴘᴛ𝟷:* ᴘʟᴀʏ ᴠs ʙᴏᴛ\n`;
        modeMsg += `│ 👥 *ᴏᴘᴛ𝟸:* ᴘʟᴀʏ ᴠs ғʀɪᴇɴᴅ\n`;
        modeMsg += `└────────────────────────┈\n\n`;
        modeMsg += `◈ *ʀᴇᴘʟʏ:* ʙᴏᴛ | ғʀɪᴇɴᴅ`;

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
                game.playerNames.push("ᴠ_ʜᴜʙ ᴀɪ 🤖");
                game.players.push("bot_id");
                game.status = "PLAYING";
                await sock.sendMessage(from, { text: "┌─『 ᴠ-ʜᴜʙ 』\n│ 🤖 ʙᴏᴛ ᴍᴏᴅᴇ ᴀᴄᴛɪᴠᴀᴛᴇᴅ!\n└────────────────────────┈" });
                return renderBoard(sock, from, game);
            } 
            
            if (input === "friend") {
                game.mode = "FRIEND";
                game.status = "WAITING";
                await sock.sendMessage(from, { text: "┌─『 ᴠ-ʜᴜʙ 』\n│ ⏳ ᴡᴀɪᴛɪɴɢ ғᴏʀ ғʀɪᴇɴᴅ...\n│ 💡 ᴛʏᴘᴇ *ᴊᴏɪɴ* ᴛᴏ ᴇɴᴛᴇʀ!\n└────────────────────────┈" });
                
                game.timer = setTimeout(async () => {
                    if (global.gamestate.get(from)?.status === "WAITING") {
                        global.gamestate.delete(from);
                        await sock.sendMessage(from, { text: "│ ⏰ ᴛɪᴍᴇ ᴏᴜᴛ. ɢᴀᴍᴇ ᴄᴀɴᴄᴇʟʟᴇᴅ." });
                    }
                }, 60000);
                return;
            }
        }

        // 2. JOIN LOGIC
        if (game.status === "WAITING" && input === "join") {
            if (sender === game.players[0]) return;
            clearTimeout(game.timer);
            game.players.push(sender);
            game.playerNames.push(msg.pushName || "ғʀɪᴇɴᴅ");
            game.status = "PLAYING";
            await sock.sendMessage(from, { text: `│ ✅ *${game.playerNames[1]}* ᴊᴏɪɴᴇᴅ!` });
            return renderBoard(sock, from, game);
        }

        // 3. MOVE LOGIC
        if (game.status === "PLAYING") {
            if (sender !== game.turn) return;
            const movePattern = /^[a-h][1-8]\s[a-h][1-8]$/;
            if (!movePattern.test(input)) return;

            const [fromPos, toPos] = input.split(' ');
            if (updateBoard(game, fromPos, toPos)) {
                game.turn = game.players.find(p => p !== sender);
                await renderBoard(sock, from, game);

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

// --- ELITE HELPERS ---

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
    let boardStr = `┌────────────────────────┈\n`;
    boardStr += `│      *ᴄʜᴇss_ʙᴏᴀʀᴅ* \n`;
    boardStr += `└────────────────────────┈\n\n`;
    boardStr += `    ᴀ  ʙ  ᴄ  ᴅ  ᴇ  ғ  ɢ  ʜ\n`;
    game.board.forEach((row, i) => {
        boardStr += `${8 - i} [${row.join('][')}] ${8 - i}\n`;
    });
    boardStr += `    ᴀ  ʙ  ᴄ  ᴅ  ᴇ  ғ  ɢ  ʜ\n\n`;
    const currentName = game.turn === game.players[0] ? game.playerNames[0] : game.playerNames[1];
    boardStr += `┌─『 sᴛᴀᴛᴜs_ʟᴏɢ 』\n`;
    boardStr += `│ 🎮 *ᴛᴜʀɴ:* ${currentName}\n`;
    boardStr += `│ 📝 *ᴍᴏᴠᴇ:* a𝟸 a𝟺\n`;
    boardStr += `└────────────────────────┈\n\n`;
    boardStr += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

    return sock.sendMessage(from, { text: boardStr });
}

export default chessCommand;
