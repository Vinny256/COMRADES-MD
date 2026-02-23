const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

async function igDownload(url) {
    console.log(`🚀 [IG_SCRAPER] Initializing request for: ${url}`);
    
    // METHOD 1: SnapInsta
    try {
        const params = qs.stringify({ url: url, lang: 'en' });
        const { data } = await axios.post('https://snapinsta.app/action.php', params, {
            timeout: 5000, // Don't wait forever
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const $ = cheerio.load(data);
        const dl = $('a.btn-download').attr('href');
        if (dl) return { mediaUrl: dl };
    } catch (e) {
        console.log(`⚠️ [IG_SCRAPER] Method 1 failed, trying Method 2...`);
    }

    // METHOD 2: Saveig (Fallback)
    try {
        const { data } = await axios.post('https://saveig.app/api/ajaxSearch', qs.stringify({ q: url, t: 'media', lang: 'en' }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const $ = cheerio.load(data.data);
        const dl = $('a.btn-download').attr('href');
        if (dl) return { mediaUrl: dl };
    } catch (e) {
        console.error(`❌ [IG_SCRAPER] All methods failed.`);
        throw new Error("DNS_LOOKUP_FAILURE");
    }
}

module.exports = { igDownload };