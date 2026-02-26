const { spawn } = require('child_process');
const fs = require('fs');

/**
 * V-HUB MASTER DOWNLOADER v2.0
 * Updated to handle custom box-style caption edits
 */
async function downloadMedia(url, type, sock, from, messageKey, videoTitle = "Unknown") {
    return new Promise((resolve, reject) => {
        const isAudio = type === 'mp3';
        const fileName = `vhub_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`;
        const filePath = `./temp/${fileName}`;

        // Ensure temp directory exists
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

        const args = isAudio 
            ? ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '-o', filePath, url]
            : ['-f', 'best[height<=720]', '--ext', 'mp4', '-o', filePath, url];

        const process = spawn('yt-dlp', ['--newline', ...args]);

        process.stdout.on('data', (data) => {
            const output = data.toString();
            const match = output.match(/(\d+\.\d+)%/);
            
            if (match) {
                const percentage = Math.floor(parseFloat(match[1]));
                
                // Update every 10% to avoid WhatsApp spam filters
                if (percentage % 10 === 0) {
                    const filled = Math.floor(percentage / 10);
                    const bar = "█".repeat(filled) + "░".repeat(10 - filled);
                    
                    // 🛡️ RECONSTRUCTING YOUR GHOST BOX
                    const updatedCaption = `┏━━━━━ ✿ YT_RESULT ✿ ━━━━━┓\n┃\n┃  TITLE: ${videoTitle.slice(0, 15)}...\n┃  PROG: [${bar}]\n┃  STAT: [ ${percentage}% ]\n┃\n┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`;

                    sock.sendMessage(from, { 
                        text: updatedCaption, 
                        edit: messageKey 
                    }).catch(e => console.log("Edit error:", e));
                }
            }
        });

        process.on('close', (code) => {
            if (code === 0) resolve(filePath);
            else reject(new Error(`yt-dlp exited with code ${code}`));
        });
    });
}

module.exports = { downloadMedia };
