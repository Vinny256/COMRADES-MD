import axios from 'axios';

const wcgCommand = {
    name: "wcg",
    category: "games",
    desc: "PvP Word Chain Survival (15s Turn)",
    async execute(sock, msg, args, { from, prefix }) {
        if (global.gamestate.has(from)) return;

        const player1 = msg.key.participant || msg.key.remoteJid;
        const player1Name = msg.pushName || "ᴘʟᴀʏᴇʀ_𝟷";

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

        let joinMsg = `┌────────────────────────┈\n`;
        joinMsg += `│      *ᴡᴄɢ_sᴜʀᴠɪᴠᴀʟ* \n`;
        joinMsg += `└────────────────────────┈\n\n`;
        joinMsg += `┌─『 ɢᴀᴍᴇ_ʟᴏʙʙʏ 』\n`;
        joinMsg += `│ 👑 *ʜᴏsᴛ:* ${player1Name}\n`;
        joinMsg += `│ 🏆 *ᴍᴏᴅᴇ:* ᴘᴠᴘ_sᴜʀᴠɪᴠᴀʟ\n`;
        joinMsg += `│ ⏳ *ᴊᴏɪɴɪɴɢ:* 𝟼𝟶s ʀᴇᴍᴀɪɴɪɴɢ\n`;
        joinMsg += `└────────────────────────┈\n\n`;
        joinMsg += `◈ *ᴀᴄᴛɪᴏɴ:* ᴛʏᴘᴇ "ᴊᴏɪɴ" ᴛᴏ ᴇɴᴛᴇʀ!`;
        
        await sock.sendMessage(from, { text: joinMsg });

        // 1 Minute Join Timeout
        gameData.timer = setTimeout(async () => {
            const currentGame = global.gamestate.get(from);
            if (currentGame && currentGame.status === "WAITING") {
                if (currentGame.players.length < 2) {
                    global.gamestate.delete(from);
                    await sock.sendMessage(from, { text: "┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ ɴᴏᴛ ᴇɴᴏᴜɢʜ ᴘʟᴀʏᴇʀs.\n└────────────────────────┈" });
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

        // --- JOIN LOGIC ---
        if (game.status === "WAITING" && input === "JOIN") {
            if (game.players.includes(sender)) return;
            
            game.players.push(sender);
            const pName = msg.pushName || `ᴘʟᴀʏᴇʀ_${game.players.length}`;
            game.playerNames.push(pName);
            game.scores[sender] = 0;
            
            await sock.sendMessage(from, { text: `│ ✅ *${pName}* ʜᴀs ᴇɴᴛᴇʀᴇᴅ ᴛʜᴇ ᴀʀᴇɴᴀ!` });

            if (game.players.length >= 2) {
                clearTimeout(game.timer);
                startGame(sock, from, game);
            }
            return;
        }

        // --- GAMEPLAY LOGIC ---
        if (game.status === "PLAYING") {
            const currentPlayer = game.players[game.currentTurn];
            if (sender !== currentPlayer) return;

            if (game.lastLetter && input[0] !== game.lastLetter) {
                return sock.sendMessage(from, { text: `│ ❌ ᴍᴜsᴛ sᴛᴀʀᴛ ᴡɪᴛʜ: *"${game.lastLetter}"*` });
            }

            if (game.usedWords.includes(input)) {
                return sock.sendMessage(from, { text: `│ ❌ *"${input}"* ᴀʟʀᴇᴀᴅʏ ᴜsᴇᴅ!` });
            }

            try {
                const isReal = await checkWord(input);
                if (!isReal) {
                    return sock.sendMessage(from, { text: `│ ❌ *"${input}"* ɪs ɴᴏᴛ ᴠᴀʟɪᴅ.` });
                }

                clearTimeout(game.timer);
                game.usedWords.push(input);
                game.lastLetter = input.slice(-1);
                game.currentWordCount++;
                game.scores[sender] += 10; 

                if (game.currentWordCount < game.requiredWords) {
                    const remaining = game.requiredWords - game.currentWordCount;
                    await sock.sendMessage(from, { 
                        text: `┌─『 ᴡᴏʀᴅ_ᴀᴄᴄᴇᴘᴛᴇᴅ 』\n│ ✅ *${input}*\n│ 👉 ɴᴇxᴛ sᴛᴀʀᴛs ᴡɪᴛʜ: *${game.lastLetter}*\n│ 🔢 ɴᴇᴇᴅᴇᴅ: *${remaining}*\n└────────────────────────┈` 
                    });
                    startTurnTimer(sock, from, game);
                } else {
                    game.currentWordCount = 0;
                    game.requiredWords++; 
                    game.currentTurn = (game.currentTurn + 1) % game.players.length;
                    
                    const nextUser = game.playerNames[game.currentTurn];
                    let nextMsg = `┌────────────────────────┈\n`;
                    nextMsg += `│      *ᴛᴜʀɴ_ᴄᴏᴍᴘʟᴇᴛᴇ* \n`;
                    nextMsg += `└────────────────────────┈\n\n`;
                    nextMsg += `┌─『 ɴᴇxᴛ_ᴘʟᴀʏᴇʀ 』\n`;
                    nextMsg += `│ 👤 *ᴜsᴇʀ:* ${nextUser}\n`;
                    nextMsg += `│ 🎯 *ɢᴏᴀʟ:* ${game.requiredWords} ᴡᴏʀᴅs\n`;
                    nextMsg += `│ 👉 *sᴛᴀʀᴛ ᴡɪᴛʜ:* ${game.lastLetter}\n`;
                    nextMsg += `└────────────────────────┈`;
                    
                    await sock.sendMessage(from, { text: nextMsg });
                    startTurnTimer(sock, from, game);
                }
            } catch (e) {
                console.error("WCG Error:", e.message);
            }
        }
    }
};

// --- ELITE HELPERS ---

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
    let startMsg = `┌────────────────────────┈\n`;
    startMsg += `│      *ɢᴀᴍᴇ_sᴛᴀʀᴛᴇᴅ* \n`;
    startMsg += `└────────────────────────┈\n\n`;
    startMsg += `┌─『 sᴜʀᴠɪᴠᴀʟ_ɪɴɪᴛ 』\n`;
    startMsg += `│ 👤 *ғɪʀsᴛ:* ${user}\n`;
    startMsg += `│ 🎯 *ɢᴏᴀʟ:* ${game.requiredWords} ᴡᴏʀᴅs\n`;
    startMsg += `│ ⏱️ *ᴛɪᴍᴇ:* 𝟷𝟻s ᴘᴇʀ ᴡᴏʀᴅ\n`;
    startMsg += `└────────────────────────┈\n\n`;
    startMsg += `◈ *ᴀᴄᴛɪᴏɴ:* ᴛʏᴘᴇ ᴀɴʏ ᴡᴏʀᴅ ᴛᴏ ʙᴇɢɪɴ!`;
    
    sock.sendMessage(from, { text: startMsg });
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

        let endMsg = `┌─『 ᴛɪᴍᴇ_ᴏᴜᴛ 』\n`;
        endMsg += `│ 💀 ${loser} ᴇʟɪᴍɪɴᴀᴛᴇᴅ!\n`;
        endMsg += `│ 🏆 *ᴡɪɴɴᴇʀ:* ${winner}\n`;
        endMsg += `│ 💰 *ᴘᴏɪɴᴛs:* ${winScore}\n`;
        endMsg += `└────────────────────────┈`;
        
        await sock.sendMessage(from, { text: endMsg });
        global.gamestate.delete(from);
    }, 15000); 
}

export default wcgCommand;
