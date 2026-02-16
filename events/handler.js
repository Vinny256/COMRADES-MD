const fs = require('fs-extra');

module.exports = {
    async execute(sock, msg, settings) {
        const from = msg.key.remoteJid;

        // --- AUTOMATION: STATUS ENGINE ---
        if (from === 'status@broadcast' && settings.autoview) {
            try {
                // Phase 1: Auto View
                await sock.readMessages([msg.key]);
                
                // Phase 2: Auto React (Only if enabled in settings.json)
                if (settings.autoreact) {
                    const emojis = ['🔥', '🫡', '⭐', '⚡', '✨', '💎', '🚀'];
                    const reaction = emojis[Math.floor(Math.random() * emojis.length)];
                    
                    await sock.sendMessage(from, { 
                        react: { key: msg.key, text: reaction } 
                    }, { statusJidList: [msg.key.participant] });

                    // Solid Terminal Logging for the Director
                    console.log(`+--- [#] STATUS_LOG [#] ---+`);
                    console.log(`|  USER: ${msg.pushName || 'Contact'}`);
                    console.log(`|  VIEW: SUCCESS`);
                    console.log(`|  REACT: ${reaction}`);
                    console.log(`+--------------------------+`);
                }
            } catch (e) {
                // Ignore errors if the status was deleted quickly
            }
        }
    }
};