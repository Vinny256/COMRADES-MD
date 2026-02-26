const { spawn } = require('child_process');
const fs = require('fs');

/**
 * V-HUB MASTER DOWNLOADER v2.2 (STABLE + AUTH BUILD)
 * - Added stderr logging
 * - Added spawn error handler
 * - Added safer yt-dlp flags
 * - Playlist protection
 * - MP4 merge fix
 * - Android client bypass
 * - Cookies authentication support
 * - Preserved full styling system
 */

async function downloadMedia(url, type, sock, from, messageKey, videoTitle = "Unknown") {
    return new Promise((resolve, reject) => {

        const isAudio = type === 'mp3';
        const fileName = `vhub_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`;
        const filePath = `./temp/${fileName}`;

        // Ensure temp directory exists
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

        // 🔥 GHOST BYPASS HEADERS
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';

        // 🔥 UPDATED yt-dlp ARGUMENTS (AUTH + ANDROID BYPASS ADDED)
        const args = isAudio
            ? [
                '--cookies', 'cookies.txt',
                '--extractor-args', 'youtube:player_client=android',
                '--user-agent', userAgent,
                '--add-header', 'Accept-Language: en-US,en;q=0.9',
                '--referer', 'https://www.google.com/',
                '--no-check-certificates',
                '--geo-bypass',
                '-f', 'ba/bestaudio/best',
                '--no-playlist',
                '--extract-audio',
                '--audio-format', 'mp3',
                '--no-warnings',
                '--newline',
                '-o', filePath,
                url
              ]
            : [
                '--cookies', 'cookies.txt',
                '--extractor-args', 'youtube:player_client=android',
                '--user-agent', userAgent,
                '--add-header', 'Accept-Language: en-US,en;q=0.9',
                '--referer', 'https://www.google.com/',
                '--no-check-certificates',
                '--geo-bypass',
                '-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]',
                '--merge-output-format', 'mp4',
                '--no-playlist',
                '--no-warnings',
                '--newline',
                '-o', filePath,
                url
              ];

        // 🔥 SPAWN PROCESS
        const ytProcess = spawn('yt-dlp', args);

        // 🛑 CAPTURE REAL ERRORS
        ytProcess.stderr.on('data', (data) => {
            console.log("YT-DLP ERROR:", data.toString());
        });

        ytProcess.on('error', (err) => {
            console.log("Spawn error:", err.message);
            reject(err);
        });

        // 📊 PROGRESS TRACKER
        ytProcess.stdout.on('data', (data) => {
            const output = data.toString();
            const match = output.match(/(\d+\.\d+)%/);

            if (match) {
                const percentage = Math.floor(parseFloat(match[1]));

                // Update every 10% to avoid spam
                if (percentage % 10 === 0) {

                    const filled = Math.floor(percentage / 10);
                    const bar = "█".repeat(filled) + "░".repeat(10 - filled);

                    // 🛡️ YOUR ORIGINAL GHOST BOX (UNCHANGED)
                    const updatedCaption =
`┏━━━━━ ✿ YT_RESULT ✿ ━━━━━┓
┃
┃  TITLE: ${videoTitle.slice(0, 15)}...
┃  PROG: [${bar}]
┃  STAT: [ ${percentage}% ]
┃
┗━━━━ ✿ INF_IMPACT ✿ ━━━━┛`;

                    sock.sendMessage(from, {
                        text: updatedCaption,
                        edit: messageKey
                    }).catch(e => console.log("Edit error:", e.message));
                }
            }
        });

        // 🎯 PROCESS COMPLETE
        ytProcess.on('close', (code) => {
            if (code === 0) {
                resolve(filePath);
            } else {
                reject(new Error(`yt-dlp exited with code ${code}`));
            }
        });

    });
}

module.exports = { downloadMedia };
