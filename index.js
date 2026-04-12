// --- THE GLOBAL BUSINESS SHIELD ---
const originalWrite = process.stdout.write;
process.stdout.write = function (chunk, encoding, callback) {
    const data = chunk.toString();
    // NOISE FILTER: Hiding the library spam that clogs Heroku
    if ((data.includes('SessionEntry') || data.includes('Closing session') || data.includes('Bad MAC') || 
         data.includes('Decrypted message') || data.includes('MessageCounterError') || 
         data.includes('LID mapping') || data.includes('bulk device migration') || 
         data.includes('retry cache') || data.includes('Buffer timeout')) && 
         !data.includes('START') && !data.includes('SUCCESS') && !data.includes('INCOMING')) {
        return; 
    }
    return originalWrite.call(process.stdout, chunk, encoding, callback);
};

import 'dotenv/config';
import express from 'express';
const app = express();
app.use(express.json());

// --- V-HUB COLOR PALETTE ---
const C = {
    reset: "\x1b[0m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    bold: "\x1b[1m"
};

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const baileys = require("@whiskeysockets/baileys");

const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore, 
    Browsers, 
    fetchLatestBaileysVersion, 
    jidDecode 
} = baileys;

const makeWASocket = baileys.default || baileys;

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import zlib from 'zlib'; 
import NodeCache from "node-cache"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({ level: 'silent' }); // Set to silent to let our custom logger shine
const commands = new Map();
const settingsFile = './settings.json';
const msgRetryCounterCache = new NodeCache(); 

// In-memory message store for getMessage handler
const messageStore = new Map();

if (!global.healingRetries) global.healingRetries = new Map(); 
if (!global.activeGames) global.activeGames = new Map(); 
if (!global.gamestate) global.gamestate = new Map(); 

const decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        let decode = jidDecode(jid) || {};
        return decode.user && decode.server && decode.user + '@' + decode.server || jid;
    }
    return jid;
};

const loadedWorkers = [];
const loadResources = async () => {
    loadedWorkers.length = 0; 
    if (fs.existsSync('./workers')) {
        const workerFiles = fs.readdirSync('./workers').filter(f => f.endsWith('.js'));
        for (const file of workerFiles) {
            try { 
                const worker = await import(`./workers/${file}?update=${Date.now()}`);
                loadedWorkers.push(worker.default || worker); 
            } catch (e) { console.error(`${C.red}Worker Error: ${file}${C.reset}`, e); }
        }
    }

    const cmdPath = path.join(__dirname, 'commands');
    const autoPath = path.join(__dirname, 'automation');
    
    const readCommands = async (dir) => {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) { await readCommands(fullPath); } 
            else if (file.endsWith('.js')) {
                try {
                    const command = await import(`file://${fullPath}?update=${Date.now()}`);
                    const cmd = command.default || command;
                    if (cmd.name) {
                        if (Array.isArray(cmd.name)) cmd.name.forEach(n => commands.set(n, cmd));
                        else commands.set(cmd.name, cmd);
                    }
                } catch (e) { console.error(`${C.red}Cmd Error: ${file}${C.reset}`, e); }
            }
        }
    };
    await readCommands(cmdPath);
    await readCommands(autoPath);
    console.log(`${C.cyan}${C.bold}V-HUB ONLINE | ${commands.size} Commands | ${loadedWorkers.length} Workers${C.reset}`);
};

global.saveSettings = async () => {
    try {
        if (!fs.existsSync(settingsFile)) return;
        // Local settings preservation only in Zero-DB mode
    } catch (e) { console.error(`${C.red}Save Settings Error:${C.reset}`, e); }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let sock;

async function startVinnieHub() {
    await loadResources(); 

    const authFolder = './auth_temp';
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);
    const credsPath = path.join(authFolder, 'creds.json');

    if (!fs.existsSync(credsPath)) {
        const sessionID = process.env.SESSION_ID;
        if (sessionID?.startsWith('VINNIE~')) {
            try {
                const base64Data = sessionID.split('VINNIE~')[1];
                const decryptedData = zlib.inflateSync(Buffer.from(base64Data, 'base64')).toString();
                fs.writeFileSync(credsPath, decryptedData);
                console.log(`${C.yellow}SESSION HEALED FROM STRING${C.reset}`);
            } catch (err) { console.error(`${C.red}Session Heal Error:${C.reset}`, err); }
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();
    
    sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
        version, 
        logger, 
        browser: Browsers.macOS("Desktop"),
        markOnlineOnConnect: true, 
        msgRetryCounterCache, 
        keepAliveIntervalMs: 10000, // Faster keep-alive for stability
        syncFullHistory: true, 
        shouldSyncLidPnMappings: true,
        getMessage: async (key) => messageStore.get(`${key.remoteJid}-${key.id}`) || { conversation: '' }
    });

    sock.ev.on('creds.update', async () => {
        await saveCreds(); 
    });

    sock.ev.on('connection.update', async (u) => {
        if (u.connection === 'open') {
            console.log(`${C.green}${C.bold}VINNIE HUB: Online & Key-Sync Confirmed${C.reset}`);
            if (sock.user?.id) {
                sock.ev.emit('presence.update', { id: sock.user.id, presences: { [sock.user.id]: { lastKnownPresence: 'available' } } });
            }
        }
        if (u.connection === 'close') {
            const code = u.lastDisconnect?.error?.output?.statusCode;
            console.log(`${C.red}Connection Lost (Status: ${code})${C.reset}`);
            if (code !== DisconnectReason.loggedOut) {
                console.log(`${C.yellow}Auto-Heal Triggered...${C.reset}`);
                setTimeout(() => startVinnieHub(), 3000);
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (!['notify','append'].includes(type)) return;

        for (const m of messages) {
            if (!m.message) continue;
            const keyStr = `${m.key.remoteJid}-${m.key.id}`;
            messageStore.set(keyStr, m.message);
            if (messageStore.size > 500) messageStore.delete(messageStore.keys().next().value);
        }

        const msg = messages[0];
        const from = msg.key.remoteJid;

        // ANTI-GHOST GUARD: Ignore messages older than 60s
        const msgTime = msg.messageTimestamp;
        const now = Math.floor(Date.now() / 1000);
        if (now - msgTime > 60) return;

        let mtype = "unknown";
        let textContent = "";
        try {
            if (msg.message) {
                mtype = Object.keys(msg.message)[0];
                textContent = (mtype === 'conversation' ? msg.message.conversation 
                    : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text 
                    : msg.message[mtype]?.caption) || "";
            }
        } catch (err) {
            console.log(`${C.red}PARSING ERROR:${C.reset}`, err.message);
        }

        // HUMAN READABLE LOG: INCOMING
        const pushName = msg.pushName || "User";
        console.log(`\n${C.blue}[INCOMING] | ${from.endsWith('@g.us') ? 'GROUP' : 'PRIVATE'}${C.reset}`);
        console.log(`┃ ${C.bold}FROM:${C.reset} ${pushName} (${from})`);
        console.log(`┃ ${C.bold}TYPE:${C.reset} ${mtype}`);
        console.log(`┃ ${C.bold}MSG:${C.reset} ${textContent.slice(0, 50)}${textContent.length > 50 ? '...' : ''}`);
        console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈`);

        let settings = { mode: 'public', bluetick: true };
        try { 
            const savedSettings = fs.readJsonSync(settingsFile); 
            settings = { ...settings, ...savedSettings };
        } catch(e) { }

        const sender = msg.key.participant || from;
        const botNumber = decodeJid(sock.user.id);
        const isMe = msg.key.fromMe || decodeJid(sender) === botNumber;
        const prefix = process.env.PREFIX || ".";
        const isCommand = textContent.startsWith(prefix);
        
        if (settings.mode === 'private' && !isMe) return;

        if (isCommand) {
            (async () => {
                const args = textContent.slice(prefix.length).trim().split(/ +/);
                const cmdName = args.shift().toLowerCase();
                const command = commands.get(cmdName);
                if (!command) return;

                try {
                    // THE SYNC GRACE PERIOD
                    await sleep(1000);

                    await sock.sendMessage(from, { react: { text: '⬆️', key: msg.key } }); 
                    
                    await command.execute(sock, msg, args, { prefix, from, sender, isMe, settings, commands });
                    
                    await sock.sendPresenceUpdate('available', from);
                    await sock.readMessages([msg.key]);
                    await sock.sendMessage(from, { react: { text: '⬇️', key: msg.key } });

                    // HUMAN READABLE LOG: SUCCESS
                    console.log(`\n${C.green}[OUTGOING] | COMMAND: ${cmdName}${C.reset}`);
                    console.log(`┃ ${C.bold}TO:${C.reset} ${from}`);
                    console.log(`┃ ${C.bold}STATUS:${C.reset} SUCCESS`);
                    console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈`);

                } catch (err) {
                    console.log(`\n${C.red}[COMMAND ERROR] | ${cmdName}${C.reset}`);
                    console.log(`┃ ${C.bold}FAIL:${C.reset} ${err.message}`);
                    console.log(`┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈`);
                    await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
                }
            })();
        }

        loadedWorkers.forEach(worker => {
            try {
                if (worker?.execute) worker.execute(sock, msg, settings).catch(err => {});
                else if (typeof worker === 'function') worker(sock, msg, settings).catch(err => {});
            } catch (err) { }
        });
    });

    // Filtered standard events to prevent log flooding
    sock.ev.on('messages.update', (upd) => {});
    sock.ev.on('message-receipt.update', (r) => {});
    sock.ev.on('presence.update', (p) => {});
}

app.post('/v_hub_notify', async (req, res) => {
    if (req.headers['x-vhub-secret'] !== process.env.API_SECRET) return res.sendStatus(403);
    try {
        if (sock) {
            await sock.sendMessage(req.body.jid, { text: req.body.text });
            console.log(`${C.cyan}API NOTIFY: Message Sent to ${req.body.jid}${C.reset}`);
            res.status(200).send("OK");
        } else res.status(503).send("Sock Offline");
    } catch (e) { res.status(500).send(e.message); }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`${C.cyan}BOT_WEB_SERVER: Listening on ${PORT}${C.reset}`);
    startVinnieHub();
});
