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
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore, 
    Browsers,
    jidNormalizedUser,
    fetchLatestBaileysVersion // Added for 2026 stability
} = require("@whiskeysockets/baileys");
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

// --- 🧠 SELF-HEALING & GAME MEMORY TRACKERS ---
if (!global.healingRetries) global.healingRetries = new Map(); 
if (!global.lockedContacts) global.lockedContacts = new Set(); 
if (!global.groupNames) global.groupNames = new Map(); 
if (!global.gamestate) global.gamestate = new Map(); 

// --- 🚥 THE TASK QUEUE ---
const taskQueue = [];
let isProcessing = false;
let connectionOpenTime = 0; 

async function processQueue() {
    if (isProcessing || taskQueue.length === 0) return;
    isProcessing = true;
    const task = taskQueue.shift();
    try {
        await task();
        const jitter = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;
        await new Promise(res => setTimeout(res, jitter)); 
    } catch (e) { }
    isProcessing = false;
    processQueue();
}

// --- 🧱 ONE-TIME LOADERS (Moved outside to prevent the 76-command loop) ---
const workerPath = path.join(__dirname, 'workers');
if (!fs.existsSync(workerPath)) fs.mkdirSync(workerPath);
const workerFiles = fs.readdirSync(workerPath).filter(file => file.endsWith('.js'));
const loadedWorkers = [];

workerFiles.forEach(file => {
    try {
        const workerFn = require(path.join(workerPath, file));
        loadedWorkers.push({ name: file, fn: workerFn });
    } catch (e) { console.log(`❌ Worker Error: ${file}`, e.message); }
});

const loadCommands = () => {
    try {
        const folders = fs.readdirSync(path.join(__dirname, 'commands'));
        for (const folder of folders) {
            const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(`./commands/${folder}/${file}`);
                commands.set(command.name, command);
            }
        }
        console.log(`✅ Loaded ${commands.size} Commands`);
    } catch (e) { console.log("⚠️ Command Loader Error"); }
};
loadCommands(); // Execute once at startup

// --- 🩹 THE QUEEN HEALER ---
async function healSession(jid) {
    if (!jid || jid.includes('newsletter')) return; 
    taskQueue.push(async () => {
        try {
            const typingTime = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000;
            await global.conn.sendPresenceUpdate('composing', jid);
            await new Promise(r => setTimeout(r, typingTime));
            await global.conn.sendPresenceUpdate('paused', jid);
            if (jid.endsWith('@g.us')) {
                await global.conn.groupMetadata(jid).catch(() => {});
                console.log(`🚀 [QUEEN] 🏛️ Group Keys Synced: ${jid.split('@')[0]}`);
            } else {
                console.log(`🚀 [QUEEN] 🩹 Repaired session for: ${jid.split('@')[0]}`);
            }
        } catch (e) {}
    });
    processQueue();
}

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

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

    // Recovery Logic
    if (!fs.existsSync(credsPath)) {
        console.log("📥 [SYSTEM] Attempting Session Recovery...");
        const sessionID = process.env.SESSION_ID;
        if (sessionID?.startsWith('VINNIE~')) {
            try {
                await client.connect(); 
                const sessionRecord = await client.db("vinnieBot").collection("sessions").findOne({ sessionId: sessionID });
                if (sessionRecord) {
                    const decryptedData = zlib.inflateSync(Buffer.from(sessionRecord.data, 'base64')).toString();
                    fs.writeFileSync(credsPath, decryptedData);
                    console.log("✅ [SYSTEM] Session recovered from Database!");
                }
            } catch (err) { }
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion(); // Dynamic Versioning

    console.log(`⚙️ [SYSTEM] Initializing WA v${version.join('.')}...`);
    const sock = makeWASocket({
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, silentLogger) 
        },
        version,
        printQRInTerminal: false,
        logger: silentLogger, 
        browser: Browsers.ubuntu("Chrome"), // Stable identity
        shouldSyncHistoryMessage: () => false, 
        syncFullHistory: false,
        markOnlineOnConnect: true, 
        maxMsgRetryCount: 15, // Increased for Bad MAC recovery
        msgRetryCounterCache, 
        keepAliveIntervalMs: 30000, 
    });

    global.conn = sock; 

    sock.ev.on('creds.update', async () => {
        await saveCreds(); 
        try {
            const sessionID = process.env.SESSION_ID;
            const credsData = fs.readFileSync(credsPath);
            const compressed = zlib.deflateSync(credsData).toString('base64');
            await client.db("vinnieBot").collection("sessions").updateOne(
                { sessionId: sessionID },
                { $set: { data: compressed, updatedAt: new Date() } },
                { upsert: true }
            );
        } catch (e) { }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        let msg = messages[0];
        const from = msg.key.remoteJid;
        if (!from || from.endsWith('@newsletter')) return;

        // Auto Status View
        if (from === 'status@broadcast') {
            if (statusCache.has(msg.key.id) || (Date.now() - connectionOpenTime) < 10000) return;
            statusCache.add(msg.key.id);
            await sock.readMessages([msg.key]);
            console.log(`👁️ Status View: ${msg.pushName || 'User'}`);
            if (statusCache.size > 500) statusCache.clear();
            return;
        }

        // Repair Logic
        const mtype = Object.keys(msg.message || {})[0];
        if (mtype === 'protocolMessage' && msg.message.protocolMessage?.type === 0) {
            healSession(msg.key.participant || from);
        }

        if (!msg.message) return;

        const settings = fs.readJsonSync(settingsFile);
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        const prefix = process.env.PREFIX || ".";
        const isCommand = text.startsWith(prefix);
        const sender = msg.key.participant || from;
        const isOwner = msg.key.fromMe || settings.owners?.includes(sender);

        if (settings.mode === 'private' && !isOwner && isCommand) return; 

        // Worker Execution
        loadedWorkers.forEach(worker => {
            taskQueue.push(async () => {
                try { await worker.fn(sock, msg, settings); } catch (e) {}
            });
        });
        processQueue();

        // Command Execution
        if (isCommand) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName);
            if (command) {
                await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });
                try {
                    await command.execute(sock, msg, args, { prefix, commands, from, isMe: msg.key.fromMe, settings });
                } catch (err) { console.error("❌ Cmd Error:", err.message); }
            }
        }
    });

    sock.ev.on('connection.update', async (u) => { 
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            connectionOpenTime = Date.now(); 
            console.log("\n📡 Vinnie Hub Active | Grid Sync Online");
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("♻️ Connection lost. Restarting Stability Shield...");
                setTimeout(() => startVinnieHub(), 3000);
            }
        }
    });
}

// Global Crash Guard
process.on('uncaughtException', async (err) => {
    if (err.message.includes('Bad MAC')) {
        isProcessing = false; 
        processQueue(); 
        return;
    }
    console.error("⚠️ Supervisor caught crash:", err.message);
    setTimeout(() => startVinnieHub(), 5000);
});

startVinnieHub();
