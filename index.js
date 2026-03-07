// --- 🛡️ THE GLOBAL BUSINESS SHIELD (NUCLEAR SILENCE) ---
const originalWrite = process.stdout.write;
process.stdout.write = function (chunk, encoding, callback) {
    const data = chunk.toString();
    // SILENCE ERRORS BUT ALLOW 🚀 AND ✅ LOGS
    if ((data.includes('SessionEntry') || data.includes('Closing session') || data.includes('Bad MAC') || data.includes('Decrypted message') || data.includes('MessageCounterError')) && !data.includes('🚀') && !data.includes('✅')) {
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

// --- 🧠 MEMORY TRACKERS ---
if (!global.healingRetries) global.healingRetries = new Map(); 
if (!global.lockedContacts) global.lockedContacts = new Set(); 
if (!global.activeGames) global.activeGames = new Map(); 
if (!global.gamestate) global.gamestate = new Map(); 

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

const loadedWorkers = [];
const loadResources = () => {
    if (fs.existsSync('./workers')) {
        fs.readdirSync('./workers').filter(f => f.endsWith('.js')).forEach(file => {
            try { loadedWorkers.push(require(`./workers/${file}`)); } catch (e) { console.log(`❌ Worker Error: ${file}`); }
        });
    }
    const cmdPath = path.join(__dirname, 'commands');
    if (fs.existsSync(cmdPath)) {
        const readCommands = (dir) => {
            fs.readdirSync(dir).forEach(file => {
                const fullPath = path.join(dir, file);
                if (fs.statSync(fullPath).isDirectory()) { readCommands(fullPath); } 
                else if (file.endsWith('.js')) {
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

// --- 💾 DATABASE SYNC HEALER ---
global.saveSettings = async () => {
    try {
        if (!fs.existsSync(settingsFile)) return;
        const settings = fs.readJsonSync(settingsFile);
        const vinnieDB = client.db("vinnieBot");
        await vinnieDB.collection("config").updateOne(
            { id: "main_config" },
            { $set: settings },
            { upsert: true }
        );
        console.log("💾 Settings Backed up to Cloud");
    } catch (e) { }
};

async function startVinnieHub() {
    const authFolder = './auth_temp';
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);
    const credsPath = path.join(authFolder, 'creds.json');

    // --- 📥 DATABASE CONNECTION & SETTINGS RECOVERY ---
    try {
        await client.connect();
        console.log("📡 MongoDB Connected");
        // Pull Settings from DB before starting to avoid Heroku Reset
        const dbConfig = await client.db("vinnieBot").collection("config").findOne({ id: "main_config" });
        if (dbConfig) {
            delete dbConfig._id; delete dbConfig.id;
            fs.writeJsonSync(settingsFile, dbConfig);
            console.log("📥 Settings Pulled from Cloud");
        }
    } catch (err) { console.log("⚠️ DB Error: Using local settings."); }

    // --- 🛠️ SESSION HEALING ---
    if (!fs.existsSync(credsPath)) {
        const sessionID = process.env.SESSION_ID;
        if (sessionID?.startsWith('VINNIE~')) {
            try {
                const sessionRecord = await client.db("vinnieBot").collection("sessions").findOne({ sessionId: sessionID });
                if (sessionRecord) {
                    const decryptedData = zlib.inflateSync(Buffer.from(sessionRecord.data, 'base64')).toString();
                    fs.writeFileSync(credsPath, decryptedData);
                    console.log("✅ SESSION HEALED: Keys Synchronized");
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

        const mtype = Object.keys(msg.message)[0];
        const textContent = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        const vinnieDB = client.db("vinnieBot");
        const logsCollection = vinnieDB.collection("logs");

        // --- 📊 LIVE LOGGING ---
        if (textContent && !msg.key.fromMe) {
            console.log(`💬 Message: ${textContent} | From: ${msg.pushName || 'User'}`);
            try {
                const senderJid = msg.key.participant || from;
                await logsCollection.insertOne({
                    name: msg.pushName || "Unknown User",
                    phone: senderJid.split('@')[0],
                    message: textContent,
                    group: from.endsWith('@g.us') ? "Group" : "Private",
                    timestamp: new Date()
                });
            } catch (e) {}
        }

        // --- 👁️ STATUS VIEW + LOG ---
        if (from === 'status@broadcast') {
            if (statusCache.has(msg.key.id) || (Date.now() - connectionOpenTime) < 10000) return;
            statusCache.add(msg.key.id);
            console.log(`✨ Status Viewed: ${msg.pushName || 'Contact'}`);
            await sock.readMessages([msg.key]);
            return;
        }

        let settings = {};
        try { settings = fs.readJsonSync(settingsFile); } catch(e) { settings = { mode: 'public' }; }
        const sender = msg.key.participant || from;
        const isMe = msg.key.fromMe || sender.split('@')[0] === (process.env.OWNER_NUMBER || "254768666068");

        if (settings.mode === 'private' && !isMe) return;

        const prefix = process.env.PREFIX || ".";
        const isCommand = textContent.startsWith(prefix);

        // --- 🕹️ GAME ENGINE (PRIORITY 1) ---
        const currentGame = global.gamestate.get(from);
        if (currentGame && !isCommand) {
            const gameCmd = commands.get(currentGame.name);
            if (gameCmd?.handleMove) {
                await gameCmd.handleMove(sock, msg, textContent, currentGame);
                return;
            }
        }

        // --- 📂 MENU REDIRECTOR (PRIORITY 2) ---
        if (!isCommand && /^\d+$/.test(textContent.trim())) {
            const menuCmd = commands.get('menu');
            if (menuCmd) {
                await menuCmd.execute(sock, msg, [textContent.trim()], { prefix, from, sender, isMe, settings, commands });
                return;
            }
        }

        if (settings.bluetick) await sock.readMessages([msg.key]);
        if (!isMe && !isCommand && settings.typingMode !== 'off') {
            const action = settings.alwaysRecording ? 'recording' : 'composing';
            await sock.sendPresenceUpdate(action, from);
            setTimeout(() => sock.sendPresenceUpdate('paused', from), 10000);
        }

        // --- 🛠️ COMMANDS ---
        if (isCommand) {
            const args = textContent.slice(prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = commands.get(cmdName);
            if (command) {
                console.log(`⚙️ Executing: ${cmdName} | By: ${msg.pushName}`);
                try {
                    let admins = [];
                    if (from.endsWith('@g.us')) {
                        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
                        admins = (metadata.participants || []).filter(v => v.admin !== null).map(v => v.id);
                    }
                    await command.execute(sock, msg, args, { prefix, from, sender, isMe, settings, groupAdmins: admins, commands, logsCollection });
                } catch (err) {
                    if (!err.message.includes('Bad MAC')) console.error(`Error [${cmdName}]:`, err.message);
                }
            }
        }

        // --- 🧱 WORKERS (In Queue) ---
        loadedWorkers.forEach(worker => {
            taskQueue.push(async () => {
                try { await worker(sock, msg, settings); } catch (e) {}
            });
        });
        processQueue();
    });

    sock.ev.on('connection.update', (u) => {
        if (u.connection === 'open') {
            connectionOpenTime = Date.now();
            console.log("✅ VINNIE HUB: Connected & Sync Verified");
        }
        if (u.connection === 'close') {
            const statusCode = u.lastDisconnect?.error?.output?.statusCode;
            if (statusCode !== DisconnectReason.loggedOut) {
                console.log("⚠️ Connection Lost: Healing Session...");
                setTimeout(() => startVinnieHub(), 3000);
            }
        }
    });
}

process.on('uncaughtException', (err) => {
    if (!err.message.includes('Bad MAC')) console.error("⚠️ Crash:", err.message);
});

startVinnieHub();
