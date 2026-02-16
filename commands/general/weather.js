const axios = require('axios');

module.exports = {
    name: "weather",
    category: "general",
    desc: "Show 7-day weather forecast",
    async execute(sock, msg, args, { prefix, from }) {
        const city = args.join(" ");
        if (!city) return sock.sendMessage(from, { text: `│ ❌ Please provide a city!\n│ Example: ${prefix}weather Embu` });

        try {
            // 1. Get Coordinates
            const geo = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
            if (!geo.data.results) return sock.sendMessage(from, { text: "│ ❌ City not found!" });
            
            const { latitude, longitude, name, country } = geo.data.results[0];

            // 2. Get Forecast
            const res = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
            
            const daily = res.data.daily;

            // 3. Icon Mapper Logic
            const getIcon = (code) => {
                if (code === 0) return "☀️"; // Clear
                if (code <= 3) return "☁️";  // Cloudy
                if (code >= 51 && code <= 67) return "🌧️"; // Rain
                if (code >= 71 && code <= 77) return "❄️"; // Snow
                if (code >= 95) return "⛈️"; // Storm
                return "🌥️";
            };

            let forecast = `╭─── ~✾~ *WEATHER: ${name.toUpperCase()}* ~✾~ ───\n`;
            forecast += `│\n`;
            forecast += `│  🌍 *Location:* ${name}, ${country}\n`;
            forecast += `│  📍 *Coords:* ${latitude.toFixed(2)}, ${longitude.toFixed(2)}\n`;
            forecast += `│\n`;
            forecast += `├─『 7-DAY FORECAST 』\n`;

            for (let i = 0; i < 7; i++) {
                const date = new Date(daily.time[i]).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
                const icon = getIcon(daily.weathercode[i]);
                const max = daily.temperature_2m_max[i];
                const min = daily.temperature_2m_min[i];
                forecast += `│  ${icon} *${date}:* ${min}°C - ${max}°C\n`;
            }

            forecast += `│\n`;
            forecast += `╰─── ~✾~ *Vinnie Digital Hub* ~✾~ ───`;

            await sock.sendMessage(from, { text: forecast });

        } catch (e) {
            await sock.sendMessage(from, { text: "│ ❌ Connection to weather server failed." });
        }
    }
};