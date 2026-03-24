import fs from 'fs-extra';
import path from 'path';

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

const bioWorker = {
    name: "autobio_worker",
    async startBioRotation(sock) {
        // Run check every hour (3600000 ms)
        setInterval(async () => {
            try {
                if (!fs.existsSync(settingsFile)) return;
                
                const settings = fs.readJsonSync(settingsFile);
                if (!settings.autobio) return; 

                const date = new Date();
                // Kenya Time Logic: UTC + 3
                const hour = (date.getUTCHours() + 3) % 24; 
                const currentBio = `${bios[hour]} | Updated by V_Hub_Bot`;

                await sock.updateProfileStatus(currentBio);
                
                console.log(`┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_ʙɪᴏ_sʏɴᴄ* \n└────────────────────────┈\n\n┌─『 sʏsᴛᴇᴍ_ᴜᴘᴅᴀᴛᴇ 』\n│ 🕒 *ʜᴏᴜʀ:* ${hour}:00 ᴇᴀᴛ\n│ ✅ *sᴛᴀᴛ:* sᴜᴄᴄᴇssғᴜʟ\n│ ⚙ *ʟᴏɢ:* ʙɪᴏ_ʀᴏᴛᴀᴛᴇᴅ\n└────────────────────────┈\n`);
            } catch (e) {
                // Silently skip to prevent crash
                console.error("Bio Rotation Error:", e.message);
            }
        }, 3600000); 
    },

    // Standard execute for the loader
    async execute(sock) {
        // This ensures that when index.js loads the worker, the rotation starts
        this.startBioRotation(sock);
    }
};

export default bioWorker;
