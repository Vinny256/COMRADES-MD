// --- 🛡️ THE GLOBAL BUSINESS SHIELD (NUCLEAR SILENCE) ---
const originalWrite = process.stdout.write;
process.stdout.write = function (chunk, encoding, callback) {
    const data = chunk.toString();
    if ((data.includes('SessionEntry') || data.includes('Closing session') || data.includes('Bad MAC') || data.includes('Decrypted message') || data.includes('MessageCounterError')) && !data.includes('🚀')) {
        return; 
    }
    return originalWrite.call(process.stdout, chunk, encoding, callback);
};

require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, Browsers, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const zlib = require('zlib'); 
const { MongoClient } = require("mongodb"); 
const NodeCache = require("node-cache"); 

const silentLogger = pino({ level: 'silent' });
const commands = new Map();
const settingsFile = './settings.json';
const msgRetryCounterCache = new NodeCache(); 
const statusCache = new Set(); 

// --- 🧠 MEMORY TRACKERS (RETAINED) ---
if (!global.healingRetries) global.healingRetries = new Map(); 
if (!global.lockedContacts) global.lockedContacts = new Set(); 
if (!global.activeGames) global.activeGames = new Map(); 
if (!global.gamestate) global.gamestate = new Map(); 

// --- 🚥 THE TASK QUEUE (RAM SHIELD) ---
const taskQueue = [];
let isProcessing = false;
let connectionOpenTime = 0; 

async function processQueue() {
    if (isProcessing || taskQueue.length === 0) return;
    isProcessing = true;
    const task = taskQueue.shift();
    try {
        await task();
        await new Promise(res => setTimeout(res, 1000)); 
    } catch (e) { }
    isProcessing = false;
    processQueue();
}

// --- 🧱 DYNAMIC LOADER (FIXED TO FIND ALL COMMANDS) ---
const loadedWorkers = [];
const loadResources = () => {
    // 1. Load Workers
    if (fs.existsSync('./workers')) {
        fs.readdirSync('./workers').filter(f => f.endsWith('.js')).forEach(file => {
            try { loadedWorkers.push(require(`./workers/${file}`)); } catch (e) { console.log(`❌ Worker Error: ${file}`); }
        });
    }

    // 2. Load Commands (Recursive - Scans every subfolder)
    const cmdPath = path.join(__dirname, 'commands');
    if (fs.existsSync(cmdPath)) {
        const readCommands = (dir) => {
            fs.readdirSync(dir).forEach(file => {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) {
                    readCommands(fullPath);
                } else if (file.endsWith('.js')) {
                    try {
                        const command = require(fullPath);
                        if (command.name) commands.set(command.name, command);
                    } catch (e) { console.log(`❌ Cmd Error: ${file}`); }
                }
            });
        };
        readCommands(cmdPath);
    }
    console.log(`🚀 V-HUB ONLINE | ${commands.size} Commands | ${loadedWorkers.length} Workers`);
};
loadResources();

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

// --- 💾 DATABASE SYNC HEALER (RESTORED) ---
    global.saveSettings = async () => {
        try {
            if (!fs.existsSync(settingsFile)) return;
            const settings = fs.readJsonSync(settingsFile);
            await client.db("vinnieBot").collection("config").updateOne(
                { id: "main_config" },
                { $set: settings },
                { upsert: true }
            );
        } catch (e) { }
    };

async function startVinnieHub() {
    const authFolder = './auth_temp';
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);
    const credsPath = path.join(authFolder, 'creds.json');

    // --- 📥 SESSION RECOVERY ---
    if (!fs.existsSync(credsPath)) {
        const sessionID = process.env.SESSION_ID;
        if (sessionID?.startsWith('VINNIE~')) {
            try {
                await client.connect(); 
                const sessionRecord = await client.db("vinnieBot").collection("sessions").findOne({ sessionId: sessionID });
                if (sessionRecord) {
                    const decryptedData = zlib.inflateSync(Buffer.from(sessionRecord.data, 'base64')).toString();
                    fs.writeFileSync(credsPath, decryptedData);
                    console.log("✅ Session Recovered from DB");
                }
            } catch (err) { }
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, silentLogger) },
        version, logger: silentLogger, browser: Browsers.ubuntu("Chrome"),
        markOnlineOnConnect: true, msgRetryCounterCache, keepAliveIntervalMs: 30000,
    });

    sock.ev.on('creds.update', async () => {
        await saveCreds(); 
        try {
            const credsData = fs.readFileSync(credsPath);
            const compressed = zlib.deflateSync(credsData).toString('base64');
            await client.db("vinnieBot").collection("sessions").updateOne(
                { sessionId: process.env.SESSION_ID },
                { $set: { data: compressed, updatedAt: new Date() } },
                { upsert: true }
            );
        } catch (e) { }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        let msg = messages[0];
        const from = msg.key.remoteJid;
        if (!from || from.endsWith('@newsletter') || !msg.message) return;

        // --- 👁️ STATUS VIEW ---
        if (from === 'status@broadcast') {
            if (statusCache.has(msg.key.id) || (Date.now() - connectionOpenTime) < 10000) return;
            statusCache.add(msg.key.id);
            await sock.readMessages([msg.key]);
            return;
        }

        // --- 🛡️ SHIELDS ---
        let settings = {};
        try { settings = fs.readJsonSync(settingsFile); } catch(e) { settings = { mode: 'public' }; }
        const sender = msg.key.participant || from;
        const isMe = msg.key.fromMe || sender.split('@')[0] === (process.env.OWNER_NUMBER || "254768666068");

        if (settings.mode === 'private' && !isMe) return;

        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        const prefix = process.env.PREFIX || ".";
        const isCommand = text.startsWith(prefix);

        // --- 🔵 BLUE TICK & PRESENCE ---
        if (settings.bluetick) await sock.readMessages([msg.key]);
        if (!isMe && !isCommand && settings.typingMode !== 'off') {
            const action = settings.alwaysRecording ? 'recording' : 'composing';
            await sock.sendPresenceUpdate(action, from);
            setTimeout(() => sock.sendPresenceUpdate('paused', from), 10000);
        }

        // --- 🛠️ COMMAND EXECUTION ---
        if (isCommand) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = commands.get(cmdName);
            if (command) {
                try {
                    let admins = [];
                    if (from.endsWith('@g.us')) {
                        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
                        admins = (metadata.participants || []).filter(v => v.admin !== null).map(v => v.id);
                    }
                    // RE-ADDED COMMANDS HERE TO FIX THE MENU SIZE ERROR
                    await command.execute(sock, msg, args, { 
                        prefix, from, sender, isMe, settings, groupAdmins: admins, commands 
                    });
                } catch (err) {
                    if (!err.message.includes('Bad MAC')) console.error(`Error [${cmdName}]:`, err.message);
                }
            }
        }

        // --- 🧱 WORKERS (IN THE QUEUE) ---
        loadedWorkers.forEach(worker => {
            taskQueue.push(async () => {
                try { await worker(sock, msg, settings); } catch (e) {}
            });
        });
        processQueue();
    });

    sock.ev.on('connection.update', (u) => {
        if (u.connection === 'open') connectionOpenTime = Date.now();
        if (u.connection === 'close' && u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            setTimeout(() => startVinnieHub(), 3000);
        }
        console.log("📡 Connection Status:", u.connection);
    });
}

process.on('uncaughtException', (err) => {
    if (!err.message.includes('Bad MAC')) console.error("⚠️ Crash:", err.message);
});

startVinnieHub();
