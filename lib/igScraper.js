import axios from 'axios';
import * as cheerio from 'cheerio';
import qs from 'qs';
import dns from 'dns';

// --- 🛡️ HEROKU NETWORK SHIELD ---
// Fixes IPv6 resolution delays on Heroku/Vercel dynos
dns.setDefaultResultOrder('ipv4first');

/**
 * V-HUB INSTAGRAM SCRAPER v3.1 (ESM + MULTI-FALLBACK)
 * - SnapInsta (Primary)
 * - SaveIG (Secondary)
 */
const igDownload = async (url) => {
    console.log(`┌─『 ᴠ-ʜᴜʙ_sᴄʀᴀᴘᴇʀ 』\n│ 🛰️ *ᴛᴀʀɢᴇᴛ:* ɪɴsᴛᴀɢʀᴀᴍ\n│ ⚙ *ʟᴏɢ:* ɪɴɪᴛɪᴀᴛɪɴɢ_ʀᴇǫᴜᴇsᴛ\n└────────────────────────┈`);

    const browserHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
    };

    // ===============================
    // METHOD 1 — SnapInsta
    // ===============================
    try {
        console.log("🔎 [ᴘʀɪᴍᴀʀʏ]: ᴛʀʏɪɴɢ_sɴᴀᴘɪɴsᴛᴀ...");

        const params = qs.stringify({
            url: url,
            lang: 'en'
        });

        const { data } = await axios.post(
            'https://snapinsta.app/action.php',
            params,
            {
                timeout: 15000,
                headers: {
                    ...browserHeaders,
                    'Origin': 'https://snapinsta.app',
                    'Referer': 'https://snapinsta.app/'
                }
            }
        );

        const $ = cheerio.load(data);
        const dl = $('a.btn-download').attr('href');

        if (dl) {
            console.log("✅ [sᴜᴄᴄᴇss]: sɴᴀᴘɪɴsᴛᴀ_ᴅᴇʟɪᴠᴇʀᴇᴅ");
            return { mediaUrl: dl };
        }
    } catch (e) {
        console.log("⚠️ [ᴡᴀʀɴ]: sɴᴀᴘɪɴsᴛᴀ_ᴏғғʟɪɴᴇ ->", e.message);
    }

    // ===============================
    // METHOD 2 — SaveIG (Fallback)
    // ===============================
    try {
        console.log("🔎 [ғᴀʟʟʙᴀᴄᴋ]: ᴛʀʏɪɴɢ_sᴀᴠᴇɪɢ...");

        const { data } = await axios.post(
            'https://saveig.app/api/ajaxSearch',
            qs.stringify({
                q: url,
                t: 'media',
                lang: 'en'
            }),
            {
                timeout: 15000,
                headers: {
                    ...browserHeaders,
                    'Origin': 'https://saveig.app',
                    'Referer': 'https://saveig.app/'
                }
            }
        );

        if (data && data.data) {
            const $ = cheerio.load(data.data);
            const dl = $('a.btn-download').attr('href');

            if (dl) {
                console.log("✅ [sᴜᴄᴄᴇss]: sᴀᴠᴇɪɢ_ᴅᴇʟɪᴠᴇʀᴇᴅ");
                return { mediaUrl: dl };
            }
        }
    } catch (e) {
        console.log("❌ [ᴇʀʀᴏʀ]: sᴀᴠᴇɪɢ_ғᴀɪʟᴇᴅ ->", e.message);
    }

    // ===============================
    // FINAL FAILURE
    // ===============================
    console.error("❌ [ᴄʀɪᴛɪᴄᴀʟ]: ᴀʟʟ_ɪɢ_ᴍᴇᴛʜᴏᴅs_ᴠᴏɪᴅ");
    throw new Error("IG_DOWNLOAD_FAILED");
}

export default { igDownload };
