module.exports = {
    name: "akin",
    category: "games",
    desc: "Think of a character and I will guess it!",
    async execute(sock, msg, args, { from }) {
        if (global.gamestate.has(from)) {
            return sock.sendMessage(from, { text: "❌ A game is already active!" });
        }

        // 🧠 Logic Tree for Guessing
        const questions = [
            "Is your character from an Anime?", 
            "Is your character a Superhero?",
            "Does your character have special powers?",
            "Is your character known for wearing a mask?"
        ];

        const gameData = {
            name: "akin",
            step: 0,
            answers: [],
            player: msg.key.participant || from
        };

        global.gamestate.set(from, gameData);

        const intro = `┏━━━━━ ✿ *V_HUB AKINATOR* ✿ ━━━━━┓\n┃\n┃  🧞 *Think of a famous character...*\n┃\n┃  ❓ *Q1:* ${questions[0]}\n┃\n┃  👉 *Reply with:* Yes / No\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
        
        await sock.sendMessage(from, { text: intro });
    },

    async handleMove(sock, msg, text, game) {
        const from = msg.key.remoteJid;
        const ans = text.toLowerCase().trim();

        if (ans !== 'yes' && ans !== 'no') return;

        game.answers.push(ans);
        game.step++;

        const questions = [
            "Is your character from an Anime?",
            "Is your character a Male?",
            "Is your character the main protagonist?",
            "Does your character wear Red/Orange?"
        ];

        if (game.step < questions.length) {
            const nextQ = `┏━━━━━ ✿ *V_HUB AKINATOR* ✿ ━━━━━┓\n┃\n┃  ❓ *Q${game.step + 1}:* ${questions[game.step]}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            await sock.sendMessage(from, { text: nextQ });
        } else {
            // 🔮 The Final Guessing Logic (Example results)
            let guess = "Iron Man"; 
            if (game.answers[0] === 'yes' && game.answers[3] === 'yes') guess = "Naruto Uzumaki";
            else if (game.answers[0] === 'yes' && game.answers[3] === 'no') guess = "Monkey D. Luffy";
            else if (game.answers[0] === 'no' && game.answers[1] === 'yes') guess = "Spider-Man";
            else guess = "Taylor Swift";

            const result = `┏━━━━━ ✿ *V_HUB AKINATOR* ✿ ━━━━━┓\n┃\n┃  🔮 *I HAVE DECIDED!*\n┃\n┃  🎭 *Character:* ${guess}\n┃\n┃  _Was I right? Type .akin to play again!_\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;
            
            await sock.sendMessage(from, { text: result });
            global.gamestate.delete(from);
        }
    }
};