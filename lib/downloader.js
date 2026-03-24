import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

/**
 * V-HUB MASTER DOWNLOADER v2.5 (ESM + GRID_BYPASS)
 * Optimized for Node v24 + Baileys v7
 */

const downloadMedia = async (url, type, sock, from, messageKey, videoTitle = "Unknown") => {
    return new Promise((resolve, reject) => {

        const isAudio = type === 'mp3';
        const fileName = `vhub_${Date.now()}.${isAudio ? 'mp3' : 'mp4'}`;
        const filePath = `./temp/${fileName}`;

        // Ensure temp directory exists
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

        // 🔥 GHOST BYPASS HEADERS (2026 ELITE SUITE)
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

        // 🔥 YT-DLP ARGUMENTS (AUTH + ANDROID BYPASS + 720P LIMIT)
        const args = [
            '--cookies', 'cookies.txt',
            '--extractor-args', 'youtube:player_client=android,ios',
            '--user-agent', userAgent,
            '--add-header', 'Accept-Language: en-US,en;q=0.9',
            '--referer', 'https://www.google.com/',
            '--no-check-certificates',
            '--geo-bypass',
            '--no-playlist',
            '--no-warnings',
            '--newline',
            '-o', filePath
        ];

        if (isAudio) {
            args.push('-f', 'ba/bestaudio/best', '--extract-audio', '--audio-format', 'mp3');
        } else {
            // Limits to 720p to prevent Heroku RAM crashes (512MB limit)
            args.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]', '--merge-output-format', 'mp4');
        }

        args.push(url);

        // --- 🚀 SPAWN ENGINE ---
        const ytProcess = spawn('yt-dlp', args);

        ytProcess.stderr.on('data', (data) => {
            const errLog = data.toString();
            if (errLog.includes('ERROR')) console.error("🛰️ [YT-DLP_ERR]:", errLog.trim());
        });

        ytProcess.on('error', (err) => {
            console.error("❌ [SPAWN_FAIL]:", err.message);
            reject(err);
        });

        // --- 📊 PROGRESS SYNC ---
        let lastPercent = -1;
        ytProcess.stdout.on('data', (data) => {
            const output = data.toString();
            const match = output.match(/(\d+\.\d+)%/);

            if (match) {
                const percentage = Math.floor(parseFloat(match[1]));

                // Update UI every 10% to save WhatsApp API bandwidth
                if (percentage % 10 === 0 && percentage !== lastPercent) {
                    lastPercent = percentage;
                    const filled = Math.floor(percentage / 10);
                    const bar = "█".repeat(filled) + "░".repeat(10 - filled);

                    const updatedCaption = 
`┌────────────────────────┈\n` +
`│      *ᴠ-ʜᴜʙ_ᴅᴏᴡɴʟᴏᴀᴅᴇʀ* \n` +
`└────────────────────────┈\n\n` +
`┌─『 ᴘʀᴏɢʀᴇss_ᴛʀᴀᴄᴋᴇʀ 』\n` +
`│ 🎬 *ᴛɪᴛʟᴇ:* ${videoTitle.slice(0, 20)}...\n` +
`│ 📊 *ᴘʀᴏɢ:* [${bar}]\n` +
`│ ✅ *sᴛᴀᴛ:* [ ${percentage}% ]\n` +
`└────────────────────────┈\n\n` +
`_ɪɴꜰɪɴɪᴛᴇ ɪᴍᴘᴀᴄᴛ x ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ_`;

                    sock.sendMessage(from, {
                        text: updatedCaption,
                        edit: messageKey
                    }).catch(() => {}); // Silent catch for edit race-conditions
                }
            }
        });

        ytProcess.on('close', (code) => {
            if (code === 0) {
                resolve(filePath);
            } else {
                reject(new Error(`Exit Code: ${code}`));
            }
        });
    });
};

export default { downloadMedia };
