const axios = require('axios');

async function igDownload(url) {
    try {
        // Clean URL and add magic parameters
        const cleanUrl = url.split('?')[0];
        const apiTarget = `${cleanUrl}?__a=1&__d=dis`;

        const response = await axios.get(apiTarget, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'X-IG-App-Id': '936619743392459', // This ID is essential for public scraping
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            }
        });

        const data = response.data.graphql ? response.data.graphql.shortcode_media : response.data.items[0];
        
        if (!data) throw new Error("Could not find media data.");

        const isVideo = data.is_video;
        const mediaUrl = isVideo ? data.video_url : data.display_url;
        const caption = data.edge_media_to_caption?.edges[0]?.node?.text || "Instagram Media";

        return { mediaUrl, isVideo, caption };
    } catch (e) {
        throw new Error("Instagram protection blocked the request. Try again later.");
    }
}

module.exports = { igDownload };