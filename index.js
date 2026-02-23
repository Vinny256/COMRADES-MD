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
    jidNormalizedUser 
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
const statusCache = new Set(); // 🚀 FIX: Prevents reacting to the same status twice

// --- 🚥 THE TASK QUEUE (STILL HERE - PREVENTS BAD MAC) ---
const taskQueue = [];
let isProcessing = false;
let connectionOpenTime = 0; 

async function processQueue() {
    if (isProcessing || taskQueue.length === 0) return;
    isProcessing = true;
    const task = taskQueue.shift();
    try {
        await task();
        // --- 🎲 HUMANIZED JITTER ---
        const jitter = Math.floor(Math.random() * (3000 - 1500 + 1)) + 1500;
        await new Promise(res => setTimeout(res, jitter)); 
    } catch (e) { }
    isProcessing = false;
    processQueue();
}

// --- 🩹 THE QUEEN HEALER (FIXES BAD MAC SILENTLY) ---
async function healSession(jid) {
    if (!jid) return;
    taskQueue.push(async () => {
        try {
            // Randomized "Typing" time to look human
            const typingTime = Math.floor(Math.random() * (7000 - 4000 + 1)) + 4000;
            await global.conn.sendPresenceUpdate('composing', jid);
            await new Promise(r => setTimeout(r, typingTime));
            await global.conn.sendPresenceUpdate('paused', jid);
            
            if (jid.endsWith('@g.us')) {
                // 🏛️ GROUP HEALER: Refresh metadata to force key sync
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

if (!fs.existsSync(settingsFile)) {
    fs.writeJsonSync(settingsFile, { autoview: true, antilink: true, autoreact: true, typing: true, recording: false, antiviewonce: true, antimention: false });
}

const workerPath = path.join(__dirname, 'workers');
if (!fs.existsSync(workerPath)) fs.mkdirSync(workerPath);
const workerFiles = fs.readdirSync(workerPath).filter(file => file.endsWith('.js'));
const loadedWorkers = workerFiles.map(file => require(path.join(workerPath, file)));

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
    } catch (e) { }
};

async function startVinnieHub() {
    loadCommands();

    const authFolder = './auth_temp';
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);
    const credsPath = path.join(authFolder, 'creds.json');

    if (!fs.existsSync(credsPath)) {
        console.log("📦 Recovery Mode: Fetching session from MongoDB...");
        const sessionID = process.env.SESSION_ID;
        if (sessionID && sessionID.startsWith('VINNIE~')) {
            try {
                await client.connect();
                const db = client.db("vinnieBot");
                const sessions = db.collection("sessions");
                const sessionRecord = await sessions.findOne({ sessionId: sessionID });
                if (sessionRecord) {
                    const decryptedData = zlib.inflateSync(Buffer.from(sessionRecord.data, 'base64')).toString();
                    fs.writeFileSync(credsPath, decryptedData);
                    console.log("✅ Session recovered.");
                }
            } catch (err) { }
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    
    const sock = makeWASocket({
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, silentLogger) 
        },
        printQRInTerminal: false,
        logger: silentLogger, 
        browser: Browsers.macOS("Safari"),
        shouldSyncHistoryMessage: () => false, 
        syncFullHistory: false,
        markOnlineOnConnect: true, 
        fireInitQueries: false,      
        maxMsgRetryCount: 5, 
        msgRetryCounterCache, 
        generateHighQualityLinkPreview: false,
        keepAliveIntervalMs: 30000, 
        getMessage: async (key) => { return undefined; } 
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
        
        const isStartupGrace = (Date.now() - connectionOpenTime) < 15000;

        // --- 🩹 AUTO-REPAIR TRIGGER ---
        const mtype = Object.keys(msg.message || {})[0];
        if (mtype === 'protocolMessage' && msg.message.protocolMessage?.type === 0) {
            const repairJid = msg.key.participant || msg.key.remoteJid;
            healSession(repairJid);
        }

        let retry = 0;
        while (!msg.message && retry < 3 && !msg.key.fromMe) {
            await new Promise(res => setTimeout(res, 1000));
            retry++;
        }
        if (!msg.message) return;

        const isMe = msg.key.fromMe;
        const from = msg.key.remoteJid;
        const prefix = process.env.PREFIX || ".";
        const settings = fs.readJsonSync(settingsFile);

        if (from === 'status@broadcast' && isStartupGrace) return;

        // 🚀 FIX: Prevent Duplicate Status Reactions
        if (from === 'status@broadcast') {
            const statusID = msg.key.id;
            if (statusCache.has(statusID)) return;
            statusCache.add(statusID);
            if (statusCache.size > 500) statusCache.clear(); // Keep memory lean
        }

        const messageType = Object.keys(msg.message)[0];
        const text = (
            messageType === 'conversation' ? msg.message.conversation :
            messageType === 'extendedTextMessage' ? msg.message.extendedTextMessage.text :
            messageType === 'imageMessage' ? msg.message.imageMessage.caption :
            messageType === 'videoMessage' ? msg.message.videoMessage.caption :
            msg.message.extendedTextMessage?.text || ""
        ) || ""; 
        
        const cleanText = text.trim(); 
        const isCommand = cleanText.startsWith(prefix);

        // Put background tasks in queue
        loadedWorkers.forEach(taskFunc => {
            taskQueue.push(async () => {
                try {
                    // Randomized Status Action (Humanized)
                    if (from === 'status@broadcast') {
                        const viewDelay = Math.floor(Math.random() * (8000 - 4000 + 1)) + 4000;
                        await new Promise(r => setTimeout(r, viewDelay));
                    }
                    await taskFunc(sock, msg, settings);
                } catch (e) { }
            });
        });
        processQueue();

        if (from === 'status@broadcast') {
            try {
                const handler = require('./events/handler');
                await handler.execute(sock, msg, settings);
                return; 
            } catch (e) { return; }
        }

        if (isCommand) {
            const args = cleanText.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = commands.get(commandName);
            
            if (command) {
                // Commands skip the queue for instant reply
                await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });
                const time = new Date().toLocaleTimeString();
                const sender = msg.pushName || (isMe ? "Owner" : from.split('@')[0]);
                console.log(`[${time}] 🚀 Command: ${prefix}${commandName} | User: ${sender}`);
                
                try {
                    await command.execute(sock, msg, args, { prefix, commands, from, isMe, settings });
                } catch (err) { 
                    console.error("❌ Command Error:", err.message);
                }
            }
        }

        try {
            const handler = require('./events/handler');
            await handler.execute(sock, msg, settings);
        } catch (e) { }
    });

    setInterval(async () => {
        try {
            const files = fs.readdirSync(authFolder);
            for (const file of files) {
                if (file !== 'creds.json' && !file.includes('app-state') && !file.includes('pre-key') && !file.includes('session')) {
                    fs.removeSync(path.join(authFolder, file));
                }
            }
        } catch (err) { }
    }, 1000 * 60 * 60 * 2); 

    sock.ev.on('connection.update', async (u) => { 
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            connectionOpenTime = Date.now(); 
            console.log("\n📡 Vinnie Hub Active | Grid Sync Online");
            try {
                const automation = require('./events/automation');
                automation.startBioRotation(sock);
            } catch (e) { }
        }
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log(`[GRID] Connection Closed (${reason}). Rebooting in 2s...`);
                setTimeout(() => startVinnieHub(), 2000);
            }
        }
    });
}

process.on('uncaughtException', (err) => {
    const errorMsg = err.message;
    
    // 🚀 EMERGENCY DECRYPTION UNBLOCKER
    if (errorMsg.includes('Bad MAC') || errorMsg.includes('Chain closed')) {
        console.log(`🚀 [QUEEN] Emergency MAC Repair Triggered. Unblocking Engine...`);
        isProcessing = false; // Force clear the block
        processQueue(); // Resume the next task
        return;
    }

    if (errorMsg.includes('InternalServerError') || errorMsg.includes('Key used already')) {
        return;
    }
    console.error("⚠️ Supervisor caught crash:", err.message);
    setTimeout(() => startVinnieHub(), 5000);
});

startVinnieHub();