const { spawn } = require('child_process');
const fs = require('fs');

/**
 * V-HUB MASTER DOWNLOADER v2.1 (STABLE BUILD)
 * - Added stderr logging
 * - Added spawn error handler
 * - Added safer yt-dlp flags
 * - Playlist protection
 * - MP4 merge fix
 * - Preserved full styling system
 */

async function downloadMedia(url, type, sock, from, messageKey, videoTitle = "Unknown") {
    return new Promise((resolve, reject) => {

        const isAudio = type === 'mp3';
        const fileName = `vhub_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`;
        const filePath = `./temp/${fileName}`;

        // Ensure temp directory exists
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

        // 🔥 SAFER yt-dlp ARGUMENTS
        const args = isAudio
            ? [
                '-f', 'bestaudio',
                '--no-playlist',
                '--extract-audio',
                '--audio-format', 'mp3',
                '--no-warnings',
                '--newline',
                '-o', filePath,
                url
              ]
            : [
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

        // 🛑 CAPTURE REAL ERRORS (IMPORTANT)
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
