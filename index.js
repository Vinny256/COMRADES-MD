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
    fetchLatestBaileysVersion 
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

// --- 🧠 MEMORY TRACKERS ---
if (!global.healingRetries) global.healingRetries = new Map(); 
if (!global.lockedContacts) global.lockedContacts = new Set(); 
if (!global.activeGames) global.activeGames = new Map(); 
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
        await new Promise(res => setTimeout(res, 1000)); 
    } catch (e) { }
    isProcessing = false;
    processQueue();
}

// --- 🧱 ONE-TIME LOADERS ---
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
loadCommands();

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
    const { version } = await fetchLatestBaileysVersion();

    console.log(`⚙️ [SYSTEM] Initializing WA v${version.join('.')}...`);
    const sock = makeWASocket({
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, silentLogger) 
        },
        version,
        logger: silentLogger, 
        browser: Browsers.ubuntu("Chrome"),
        markOnlineOnConnect: true, 
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

        // --- 👁️ STATUS VIEW (RETAINED) ---
        if (from === 'status@broadcast') {
            if (statusCache.has(msg.key.id) || (Date.now() - connectionOpenTime) < 10000) return;
            statusCache.add(msg.key.id);
            await sock.readMessages([msg.key]);
            console.log(`👁️ Status View: ${msg.pushName || 'User'}`);
            return;
        }

        if (!msg.message) return;

        // --- 🛡️ SETTINGS & PRIVATE MODE SHIELD ---
        let settings = {};
        try { settings = fs.readJsonSync(settingsFile); } catch(e) { settings = { mode: 'public' }; }

        const sender = msg.key.participant || from;
        const isMe = msg.key.fromMe || sender.split('@')[0] === (process.env.OWNER_NUMBER || "254768666068");

        // NUCLEAR SILENCE: If private mode is on and not founder, kill the process here.
        if (settings.mode === 'private' && !isMe) return;

        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        const prefix = process.env.PREFIX || ".";
        const isCommand = text.startsWith(prefix);
        const isGroup = from.endsWith('@g.us');
        const isInbox = from.endsWith('@s.whatsapp.net');

        // --- 🔵 BLUE TICK LOGIC (RETAINED) ---
        if (settings.bluetick) {
            await sock.readMessages([msg.key]);
        }

        // --- 🚥 UPDATED 10S PRESENCE WORKER ---
        const mode = settings.typingMode || 'off';
        let shouldType = (mode === 'all' || (mode === 'groups' && isGroup) || (mode === 'inbox' && isInbox));
        const skipDelay = isCommand || settings.bluetick || mtype === 'protocolMessage';

        if (shouldType && !msg.key.fromMe && !skipDelay) {
            // Check if user wants 'Recording' or 'Typing'
            const presenceAction = settings.alwaysRecording ? 'recording' : 'composing';
            await sock.sendPresenceUpdate(presenceAction, from);
            await new Promise(r => setTimeout(r, 10000)); // Fixed 10 Seconds
            await sock.sendPresenceUpdate('paused', from);
        }

        // --- 🛠️ COMMAND EXECUTION (INTACT) ---
        if (isCommand) {
            const args = text.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName);
            
            if (command) {
                try {
                    let participants = [];
                    let admins = [];
                    if (isGroup) {
                        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
                        participants = metadata.participants || [];
                        admins = participants.filter(v => v.admin !== null).map(v => v.id);
                    }

                    await command.execute(sock, msg, args, { 
                        prefix, 
                        commands, 
                        from, 
                        sender,
                        isGroup,
                        isMe, 
                        settings,
                        participants,
                        groupAdmins: admins 
                    });
                } catch (err) { 
                    console.error(`✿ HUB_ERROR ✿ [${commandName}]:`, err.message); 
                }
            }
        }

        // --- 🧱 BACKGROUND WORKERS (INTACT) ---
        loadedWorkers.forEach(worker => {
            taskQueue.push(async () => {
                try { await worker.fn(sock, msg, settings); } catch (e) {}
            });
        });
        processQueue();
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
                setTimeout(() => startVinnieHub(), 3000);
            }
        }
    });
}

process.on('uncaughtException', (err) => {
    if (err.message.includes('Bad MAC')) return;
    console.error("⚠️ Supervisor caught crash:", err.message);
});

startVinnieHub();
