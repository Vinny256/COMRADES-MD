const axios = require('axios');

// Global tracker to prevent API abuse (stays in memory)
const pairTracker = new Map();

module.exports = {
    name: 'pair',
    category: 'utility',
    desc: 'Generate a Vinnie Hub Pairing Code with auto-fix for Kenyan numbers.',
    async execute(sock, msg, args, { from }) {
        let input = args[0];

        // 1. Validation & Kenyan Number Fix (7... -> 2547...)
        if (!input) {
            return await sock.sendMessage(from, { 
                text: "❌ *Format Error*\n\nUsage: `.pair 7xxxxxxxx` or `.pair 2547xxxxxxxx`" 
            }, { quoted: msg });
        }

        // Clean all non-numeric characters
        let cleanedNumber = input.replace(/\D/g, "");

        // Auto-fix logic for Kenyan local formats
        if (cleanedNumber.startsWith('7') || cleanedNumber.startsWith('1')) {
            cleanedNumber = '254' + cleanedNumber;
        } else if (cleanedNumber.startsWith('07') || cleanedNumber.startsWith('01')) {
            cleanedNumber = '254' + cleanedNumber.substring(1);
        }

        // 2. Rate Limiter (Cooldown)
        const now = Date.now();
        if (pairTracker.has(from)) {
            const expiration = pairTracker.get(from) + 60000; // 1 minute cooldown
            if (now < expiration) {
                const timeLeft = ((expiration - now) / 1000).toFixed(0);
                return await sock.sendMessage(from, { 
                    text: `⏳ *COOLDOWN ACTIVE*\n\nPlease wait *${timeLeft}s* before requesting another pairing code.` 
                }, { quoted: msg });
            }
        }

        // 3. Visual Feedback
        await sock.sendMessage(from, { react: { text: "🛰️", key: msg.key } });
        
        const vStyle = (text) => `┏━━━━━ ✿ *V_HUB* ✿ ━━━━━┓\n┃\n${text}\n┃\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        try {
            // 4. Requesting Code from your Backend
            const backendUrl = 'https://comrades-session-65daf07fdaad.herokuapp.com/';
            
            // Initial status message
            const { key } = await sock.sendMessage(from, { text: "📡 *Connecting to Vinnie Pairing Server...*" }, { quoted: msg });

            const response = await axios.post(backendUrl, { phoneNumber: cleanedNumber }, { timeout: 20000 });

            if (response.data && response.data.code) {
                const pairCode = response.data.code.toUpperCase();

                // Success UI Message
                const successBody = [
                    `🛰️ *PAIRING ENGINE READY*`,
                    ` `,
                    `Target: +${cleanedNumber}`,
                    `Status: *CODE GENERATED*`,
                    ` `,
                    `*How to link:*`,
                    `1. Open WA > Linked Devices`,
                    `2. Tap 'Link with phone number'`,
                    `3. Copy/Paste the code below.`
                ].join('\n');

                await sock.sendMessage(from, { 
                    text: vStyle(successBody),
                    contextInfo: {
                        externalAdReply: {
                            title: "V_HUB PAIRING HANDSHAKE",
                            body: "Grid Sync v4.0 Online",
                            mediaType: 1,
                            thumbnailUrl: "https://avatars.githubusercontent.com/u/144422204?v=4",
                            sourceUrl: "https://github.com/Vinny256/COMRADES-MD"
                        }
                    }
                }, { quoted: msg });

                // --- 🔑 SEPARATE MESSAGE FOR EASY COPYING ---
                await sock.sendMessage(from, { text: pairCode });

                // Update tracker
                pairTracker.set(from, now);
            } else {
                throw new Error("Invalid response from server");
            }

        } catch (error) {
            console.error("Pairing Command Error:", error.message);
            await sock.sendMessage(from, { 
                text: "❌ *SERVER ERROR*\n\nUnable to reach the pairing backend. The Heroku dyno might be sleeping or offline." 
            }, { quoted: msg });
        }
    }
};