const { spawn } = require('child_process');

async function downloadWithProgress(url, type, sock, from, messageKey) {
    return new Promise((resolve, reject) => {
        const isAudio = type === 'mp3';
        const fileName = `vinnie_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`;
        const filePath = `./temp/${fileName}`;

        const args = isAudio 
            ? ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '-o', filePath, url]
            : ['-f', 'best[height<=720]', '--ext', 'mp4', '-o', filePath, url];

        const process = spawn('yt-dlp', ['--newline', ...args]);

        process.stdout.on('data', (data) => {
            const match = data.toString().match(/(\d+\.\d+)%/);
            if (match) {
                const percentage = Math.floor(parseFloat(match[1]));
                if (percentage % 10 === 0) {
                    const bar = "█".repeat(percentage / 10) + "░".repeat(10 - (percentage / 10));
                    
                    // EDITING THE CAPTION OF THE THUMBNAIL
                    sock.sendMessage(from, { 
                        text: `📥 *V-HUB DOWNLOADER*\n\n[${bar}] ${percentage}%\n\n*Status:* Fetching data...`,
                        edit: messageKey 
                    });
                }
            }
        });

        process.on('close', (code) => {
            if (code === 0) resolve(filePath);
            else reject(new Error(`Exit code ${code}`));
        });
    });
}
