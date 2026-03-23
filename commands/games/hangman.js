const hangmanCommand = {
    name: "hangman",
    category: "games",
    desc: "Guess the word letter by letter",
    async execute(sock, msg, args, { from }) {
        // 1. Check for existing game state
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴠ_ʜᴜʙ_ᴀʟᴇʀᴛ 』\n│ ⚙ ᴀ ɢᴀᴍᴇ ɪs ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ!\n└────────────────────────┈` 
            });
        }

        const words = ["GALAXY", "PROGRAM", "VINNIE", "WHATSAPP", "VALORANT", "NETFLIX", "AVENGER", "BITCOIN", "KERNEL"];
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

        // Validation: Must be 1 letter and not already guessed
        if (letter.length !== 1 || !/[A-Z]/.test(letter) || game.guessed.includes(letter)) return;

        game.guessed.push(letter);

        // Check if letter is in the word
        if (!game.word.includes(letter)) {
            game.lives--;
        }

        const isWin = game.word.split('').every(char => game.guessed.includes(char));

        if (isWin) {
            let winMsg = `┌────────────────────────┈\n`;
            winMsg += `│      *ᴠɪᴄᴛᴏʀʏ_ᴀᴄʜɪᴇᴠᴇᴅ* \n`;
            winMsg += `└────────────────────────┈\n\n`;
            winMsg += `┌─『 ɢᴀᴍᴇ_ᴏᴠᴇʀ 』\n`;
            winMsg += `│ 🎉 ᴄᴏɴɢʀᴀᴛs! ʏᴏᴜ ɢᴜᴇssᴇᴅ: *${game.word}*\n`;
            winMsg += `│ ⚙ sᴛᴀᴛᴜs: ᴡɪɴɴᴇʀ ✦\n`;
            winMsg += `└────────────────────────┈`;
            
            await sock.sendMessage(from, { text: winMsg });
            return global.gamestate.delete(from);
        }

        if (game.lives <= 0) {
            let lossMsg = `┌────────────────────────┈\n`;
            lossMsg += `│      *ᴍɪssɪᴏɴ_ғᴀɪʟᴇᴅ* \n`;
            lossMsg += `└────────────────────────┈\n\n`;
            lossMsg += `┌─『 ɢᴀᴍᴇ_ᴏᴠᴇʀ 』\n`;
            lossMsg += `│ 💀 ʏᴏᴜ ʟᴏsᴛ! ᴛʜᴇ ᴡᴏʀᴅ ᴡᴀs: *${game.word}*\n`;
            lossMsg += `│ ⚙ sᴛᴀᴛᴜs: ᴇʟɪᴍɪɴᴀᴛᴇᴅ\n`;
            lossMsg += `└────────────────────────┈`;

            await sock.sendMessage(from, { text: lossMsg });
            return global.gamestate.delete(from);
        }

        // Send updated board
        await sock.sendMessage(from, { text: renderHangman(game) });
    }
};

// --- ELITE RENDERER ---
function renderHangman(game) {
    const displayWord = game.word.split('').map(char => game.guessed.includes(char) ? char : "_").join(" ");
    const misses = game.guessed.filter(l => !game.word.includes(l)).join(", ");
    
    let board = `┌────────────────────────┈\n`;
    board += `│      *ᴠ-ʜᴜʙ_ʜᴀɴɢᴍᴀɴ* \n`;
    board += `└────────────────────────┈\n\n`;
    board += `┌─『 sᴛᴀᴛᴜs_ᴘᴀɴᴇʟ 』\n`;
    board += `│ ❤️ *ʟɪᴠᴇs:* ${"❤️".repeat(game.lives)}${"🖤".repeat(6 - game.lives)}\n`;
    board += `│ 🧩 *ᴡᴏʀᴅ:* \`${displayWord}\`\n`;
    board += `│ 🚫 *ᴍɪssᴇs:* [ ${misses || 'ɴᴏɴᴇ'} ]\n`;
    board += `└────────────────────────┈\n\n`;
    board += `◈ *ʀᴇᴘʟʏ:* ᴛʏᴘᴇ ᴏɴᴇ ʟᴇᴛᴛᴇʀ`;

    return board;
}

export default hangmanCommand;
