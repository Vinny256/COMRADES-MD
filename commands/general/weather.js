import axios from 'axios';

const weatherCommand = {
    name: "weather",
    category: "general",
    desc: "Show 7-day weather forecast",
    async execute(sock, msg, args, { prefix, from }) {
        const city = args.join(" ");
        if (!city) return sock.sendMessage(from, { 
            text: `┌─『 ᴇʀʀᴏʀ 』\n│ ⚙ *ᴜsᴀɢᴇ:* ${prefix}weather [ᴄɪᴛʏ]\n│ ⚙ *ᴇx:* ${prefix}weather Embu\n└────────────────────────┈` 
        });

        try {
            // 1. Get Coordinates
            const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
            if (!geo.data.results) return sock.sendMessage(from, { 
                text: `┌─『 ᴇʀʀᴏʀ 』\n│ ⚙ ᴄɪᴛʏ ɴᴏᴛ ғᴏᴜɴᴅ!\n└────────────────────────┈` 
            });
            
            const { latitude, longitude, name, country } = geo.data.results[0];

            // 2. Get Forecast
            const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
            
            const daily = res.data.daily;

            // 3. Icon Mapper Logic (Clean Unicodes)
            const getIcon = (code) => {
                if (code === 0) return "☀️"; // Clear
                if (code <= 3) return "☁️";  // Cloudy
                if (code >= 51 && code <= 67) return "🌧️"; // Rain
                if (code >= 71 && code <= 77) return "❄️"; // Snow
                if (code >= 95) return "⛈️"; // Storm
                return "🌥️";
            };

            // --- ⚡ UNICODE SLEEK STYLING ---
            let forecast = `┌────────────────────────┈\n`;
            forecast += `│      *ᴡᴇᴀᴛʜᴇʀ_ʀᴇᴘᴏʀᴛ* \n`;
            forecast += `└────────────────────────┈\n\n`;
            
            forecast += `┌─『 ʟᴏᴄᴀᴛɪᴏɴ 』\n`;
            forecast += `│ 🌍 *ᴄɪᴛʏ:* ${name}, ${country}\n`;
            forecast += `│ 📍 *ᴄᴏᴏʀᴅs:* ${latitude.toFixed(2)}, ${longitude.toFixed(2)}\n`;
            forecast += `└────────────────────────┈\n\n`;
            
            forecast += `┌─『 𝟽-ᴅᴀʏ ғᴏʀᴇᴄᴀsᴛ 』\n`;

            for (let i = 0; i < 7; i++) {
                const isLast = i === 6;
                const date = new Date(daily.time[i]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
                const icon = getIcon(daily.weathercode[i]);
                const max = daily.temperature_2m_max[i];
                const min = daily.temperature_2m_min[i];
                
                // Using branch unicodes for the weather list
                forecast += `│ ${isLast ? '╰' : '├'}─◈ ${icon} *${date}:* ${min}° - ${max}°ᴄ\n`;
            }

            forecast += `└────────────────────────┈\n\n`;
            forecast += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { text: forecast });

        } catch (e) {
            await sock.sendMessage(from, { 
                text: `┌─『 ᴇʀʀᴏʀ 』\n│ ⚙ ᴡᴇᴀᴛʜᴇʀ sᴇʀᴠᴇʀ ᴅᴏᴡɴ.\n└────────────────────────┈` 
            });
        }
    }
};

export default weatherCommand;
