const fs = require('fs-extra');
const settingsFile = './settings.json';

const bios = [
    "00:00 | System Refresh. V_Hub Active 🚀",
    "01:00 | Dreaming of Infinite Impact... 💤",
    "02:00 | Midnight Logic & Clean Code 👨‍💻",
    "03:00 | Coding in the Dark | V_Hub Online ⚡",
    "04:00 | Pre-dawn Audit | V_Hub Secure 🔒",
    "05:00 | Early Bird Mode | Still Innovating 🐦",
    "06:00 | Morning Coffee & New Logic ☕",
    "07:00 | System Boot: Ready for the Day ☀️",
    "08:00 | Tech Entrepreneurship in Motion 📈",
    "09:00 | Building the Digital Future... 🛠️",
    "10:00 | Innovating for the Comrades 💎",
    "11:00 | Scaling Impact | V_Hub Systems 🌊",
    "12:00 | Noon Sync: Peak Performance 🕛",
    "13:00 | Afternoon Logic & Bug Hunting 🐞",
    "14:00 | V_Hub: Infinite Possibilities ✨",
    "15:00 | High-Speed Response Enabled 🚀",
    "16:00 | Refining the Hub Experience... 🧪",
    "17:00 | Sunset Sessions | V_Hub Digital 🌇",
    "18:00 | Evening Audit | Security Active 🛡️",
    "19:00 | Logic Flow: 100% Operational 🌊",
    "20:00 | Night Mode: V_Hub Power Saving 🌙",
    "21:00 | Still Innovating. Still Active. 💎",
    "22:00 | Wrapping up the Day with Impact 🏁",
    "23:00 | Final Sync: V_Hub Standing By 🌌"
];

module.exports = {
    async startBioRotation(sock) {
        // Run check every hour
        setInterval(async () => {
            try {
                const settings = fs.readJsonSync(settingsFile);
                if (!settings.autobio) return; 

                const date = new Date();
                const hour = (date.getUTCHours() + 3) % 24; // Kenya Time (UTC+3)
                const currentBio = `${bios[hour]} | Updated by V_Hub_Bot`;

                await sock.updateProfileStatus(currentBio);
                console.log(`┏━━━━━ ✿ BIO_SYNC ✿ ━━━━━┓\n┃  HOUR: ${hour}:00\n┃  STAT: UPDATED\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`);
            } catch (e) {
                // Silently skip to prevent crash
            }
        }, 3600000); 
    }
};