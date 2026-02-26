const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * V-HUB SMOOTH-FLOW ENGINE
 * @param {string} url - The URL to download
 * @param {string} type - 'mp3' or 'mp4'
 * @param {object} sock - Your Baileys socket
 * @param {string} from - Remote JID
 * @param {object} msgKey - The message key of the thumbnail message to edit
 */
async function downloadMedia(url, type, sock, from, msgKey) {
    return new Promise((resolve, reject) => {
        const fileName = `vhub_${Date.now()}.${type === 'mp3' ? 'mp3' : 'mp4'}`;
        const filePath = path.join(__dirname, '../temp', fileName);
        
        // Ensure temp folder exists
        if (!fs.existsSync(path.join(__dirname, '../temp'))) fs.mkdirSync(path.join(__dirname, '../temp'));

        const args = type === 'mp3' 
            ? ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '--max-filesize', '15M', '-o', filePath, url]
            : ['-f', 'best[height<=720]', '--ext', 'mp4', '--max-filesize', '50M', '-o', filePath, url];

        const prc = spawn('yt-dlp', ['--newline', ...args]);

        let lastUpdate = 0;

        prc.stdout.on('data', (data) => {
            const output = data.toString();
            const match = output.match(/(\d+\.\d+)%/);
            if (match) {
                const percentage = Math.floor(parseFloat(match[1]));
                // Throttle updates to every 10% to prevent WhatsApp rate-limiting
                if (percentage >= lastUpdate + 10) {
                    lastUpdate = percentage;
                    const bar = "█".repeat(percentage / 10) + "░".repeat(10 - (percentage / 10));
                    
                    // EDITING THE CAPTION OF THE THUMBNAIL
                    sock.sendMessage(from, { 
                        text: `🚀 *V-HUB:* Downloading...\n\n[${bar}] ${percentage}%`,
                        edit: msgKey 
                    });
                }
            }
        });

        prc.on('close', (code) => {
            if (code === 0) resolve(filePath);
            else reject(new Error(`yt-dlp exited with code ${code}`));
        });
    });
}

module.exports = { downloadMedia };
