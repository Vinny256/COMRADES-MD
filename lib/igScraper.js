const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');
const dns = require('dns');

// 🔥 IMPORTANT: Fix Heroku IPv6 DNS issues
dns.setDefaultResultOrder('ipv4first');

async function igDownload(url) {
    console.log(`🚀 [IG_SCRAPER] Starting request for: ${url}`);

    const browserHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36'
    };

    // ===============================
    // METHOD 1 — SnapInsta
    // ===============================
    try {
        console.log("🔎 Trying SnapInsta...");

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
                    Origin: 'https://snapinsta.app',
                    Referer: 'https://snapinsta.app/'
                }
            }
        );

        const $ = cheerio.load(data);
        const dl = $('a.btn-download').attr('href');

        if (dl) {
            console.log("✅ SnapInsta success");
            return { mediaUrl: dl };
        }

        console.log("⚠️ SnapInsta returned no download link.");
    } catch (e) {
        console.log("⚠️ SnapInsta failed:", e.message);
    }

    // ===============================
    // METHOD 2 — SaveIG (Fallback)
    // ===============================
    try {
        console.log("🔎 Trying SaveIG...");

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
                    Origin: 'https://saveig.app',
                    Referer: 'https://saveig.app/'
                }
            }
        );

        if (!data || !data.data) {
            throw new Error("Invalid SaveIG response");
        }

        const $ = cheerio.load(data.data);
        const dl = $('a.btn-download').attr('href');

        if (dl) {
            console.log("✅ SaveIG success");
            return { mediaUrl: dl };
        }

        console.log("⚠️ SaveIG returned no download link.");
    } catch (e) {
        console.log("❌ SaveIG failed:", e.message);
    }

    // ===============================
    // FINAL FAILURE
    // ===============================
    console.error("❌ All IG download methods failed.");
    throw new Error("IG_DOWNLOAD_FAILED");
}

module.exports = { igDownload };