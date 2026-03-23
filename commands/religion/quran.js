import axios from 'axios';

const quranCommand = {
    name: "quran",
    category: "religion",
    desc: "Get a specific Quranic verse",
    async execute(sock, msg, args, { from, prefix }) {
        const query = args[0]; // Format: Surah:Ayah (e.g., 2:255)
        
        // --- 🛡️ INPUT VALIDATION ---
        if (!query || !query.includes(':')) {
            return sock.sendMessage(from, { 
                text: `┌─『 ᴜsᴀɢᴇ_ɪɴғᴏ 』\n│ ⚙ *ᴄᴏᴍᴍᴀɴᴅ:* ${prefix}ǫᴜʀᴀɴ [sᴜʀᴀʜ:ᴀʏᴀʜ]\n│ 🌙 *ᴇx:* ${prefix}ǫᴜʀᴀɴ 𝟸:𝟸𝟻𝟻\n└────────────────────────┈` 
            });
        }

        // --- ✦ INITIAL REACTION ---
        await sock.sendMessage(from, { react: { text: "🌙", key: msg.key } });

        try {
            const [surah, ayah] = query.split(':');
            
            // --- 🚀 FETCH REVELATION ---
            // Using Asad translation for high-quality English meaning
            const { data } = await axios.get(`http://api.alquran.cloud/v1/ayah/${surah}:${ayah}/en.asad`);
            
            const info = data.data;

            // --- 📑 SCRIPTURE UI CONSTRUCTION ---
            let quranMsg = `┌────────────────────────┈\n`;
            quranMsg += `│      *ᴠ-ʜᴜʙ_ɪsʟᴀᴍɪᴄ_ʟᴏɢ* \n`;
            quranMsg += `└────────────────────────┈\n\n`;
            
            quranMsg += `┌─『 ʜᴏʟʏ_ǫᴜʀᴀɴ 』\n`;
            quranMsg += `│ 📖 *sᴜʀᴀʜ:* ${info.surah.englishName}\n`;
            quranMsg += `│ 🔢 *ᴀʏᴀʜ:* ${info.numberInSurah}\n`;
            quranMsg += `│ ✨ *ᴍᴇᴀɴɪɴɢ:* ${info.surah.englishNameTranslation}\n`;
            quranMsg += `│ \n`;
            quranMsg += `│ 📜 *ᴛᴇxᴛ:* \n`;
            quranMsg += `│ ${info.text.trim()}\n`;
            quranMsg += `└────────────────────────┈\n\n`;
            
            quranMsg += `_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

            await sock.sendMessage(from, { 
                text: quranMsg 
            }, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ❌ *ᴀʏᴀʜ_ɴᴏᴛ_ғᴏᴜɴᴅ*\n│ ⚙ ʟᴏɢ: ɪɴᴠᴀʟɪᴅ_ʀᴇғᴇʀᴇɴᴄᴇ\n└────────────────────────┈` 
            });
        }
    }
};

export default quranCommand;
