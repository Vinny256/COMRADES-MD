const tttCommand = {
    name: "ttt",
    category: "games",
    desc: "Play TicTacToe against the bot",
    async execute(sock, msg, args, { from }) {
        // 1. Initialize & Safety Check
        if (!global.gamestate) global.gamestate = new Map();

        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ_ᴀʟᴇʀᴛ 』\n│ ⚙ ᴀ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ!\n└────────────────────────┈` 
            });
        }

        // 2. Initialize Game State
        const gameData = {
            name: "ttt",
            board: ['𝟷', '𝟸', '𝟹', '𝟺', '𝟻', '𝟼', '𝟽', '𝟾', '𝟿'],
            player: msg.key.participant || from,
            turn: "PLAYER"
        };

        global.gamestate.set(from, gameData);
        await sock.sendMessage(from, { text: renderBoard(gameData.board) });
    },

    // 🕹️ Interceptor Logic
    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const player = msg.key.participant || from;

        // Security: Only the initiator moves
        if (player !== game.player) return;

        const move = parseInt(text) - 1;
        if (isNaN(move) || move < 0 || move > 8 || game.board[move] === '❌' || game.board[move] === '⭕') {
            return; 
        }

        // 1. Player Move (X)
        game.board[move] = '❌';
        
        if (checkWin(game.board)) {
            let winMsg = `┌─『 ᴠɪᴄᴛᴏʀʏ_ᴀᴄʜɪᴇᴠᴇᴅ 』\n│ 🎉 ʏᴏᴜ ʙᴇᴀᴛ ᴛʜᴇ ʙᴏᴛ!\n└────────────────────────┈\n\n${renderBoard(game.board, true)}`;
            await sock.sendMessage(from, { text: winMsg });
            return global.gamestate.delete(from);
        }

        if (game.board.every(s => s === '❌' || s === '⭕')) {
            let drawMsg = `┌─『 ɢᴀᴍᴇ_ᴅʀᴀᴡ 』\n│ 🤝 ɢᴏᴏᴅ ɢᴀᴍᴇ. ɪᴛ's ᴀ ᴛɪᴇ!\n└────────────────────────┈\n\n${renderBoard(game.board, true)}`;
            await sock.sendMessage(from, { text: drawMsg });
            return global.gamestate.delete(from);
        }

        // 2. Bot Move (O) - Randomized AI
        const availableMoves = game.board.filter(s => s !== '❌' && s !== '⭕');
        const botChoice = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        const botIndex = game.board.indexOf(botChoice);
        game.board[botIndex] = '⭕';

        if (checkWin(game.board)) {
            let lossMsg = `┌─『 ᴍɪssɪᴏɴ_ғᴀɪʟᴇᴅ 』\n│ 💀 ᴠ_ʜᴜʙ ʙᴏᴛ ᴡɪɴs ᴀɢᴀɪɴ.\n└────────────────────────┈\n\n${renderBoard(game.board, true)}`;
            await sock.sendMessage(from, { text: lossMsg });
            return global.gamestate.delete(from);
        }

        // 3. Update Board
        await sock.sendMessage(from, { text: renderBoard(game.board) });
    }
};

// --- ELITE HELPERS ---

function renderBoard(b, isFinal = false) {
    let ui = `┌────────────────────────┈\n`;
    ui += `│      *ᴛɪᴄ-ᴛᴀᴄ-ᴛᴏᴇ* \n`;
    ui += `└────────────────────────┈\n\n`;
    ui += `      ${b[0]}  |  ${b[1]}  |  ${b[2]}\n`;
    ui += `      ──┼───┼──\n`;
    ui += `      ${b[3]}  |  ${b[4]}  |  ${b[5]}\n`;
    ui += `      ──┼───┼──\n`;
    ui += `      ${b[6]}  |  ${b[7]}  |  ${b[8]}\n\n`;
    ui += `┌─『 sᴛᴀᴛᴜs_ᴘᴀɴᴇʟ 』\n`;
    ui += `│ 🎮 *sᴛᴀᴛ:* ${isFinal ? 'ɢᴀᴍᴇ_ᴏᴠᴇʀ' : 'ʏᴏᴜʀ_ᴛᴜʀɴ'}\n`;
    ui += `│ ⚙ *ᴀᴄᴛɪᴏɴ:* ᴛʏᴘᴇ ᴀ ɴᴜᴍʙᴇʀ (𝟷-𝟿)\n`;
    ui += `└────────────────────────┈\n\n`;
    ui += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;
    return ui;
}

function checkWin(b) {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    return wins.some(w => b[w[0]] === b[w[1]] && b[w[0]] === b[w[2]]);
}

export default tttCommand;
