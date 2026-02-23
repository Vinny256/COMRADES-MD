const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

async function igDownload(url) {
    console.log(`🚀 [IG_SCRAPER] Initializing request for: ${url}`);
    try {
        const params = qs.stringify({ url: url, lang: 'en' });
        const { data } = await axios.post('https://snapinsta.app/action.php', params, {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const downloadUrl = $('a.btn-download').attr('href') || $('.download-bottom a').attr('href');

        if (!downloadUrl) {
            console.error(`❌ [IG_SCRAPER] Failed to find download URL in the HTML response.`);
            throw new Error("Link not found");
        }

        console.log(`✅ [IG_SCRAPER] Media successfully scraped: ${downloadUrl.substring(0, 50)}...`);
        return { mediaUrl: downloadUrl };
    } catch (e) {
        console.error(`❌ [IG_SCRAPER] Error: ${e.message}`);
        throw e;
    }
}

module.exports = { igDownload };