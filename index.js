// --- 🛡️ THE GLOBAL BUSINESS SHIELD (RESTORED LOGS) ---
const originalWrite = process.stdout.write;
process.stdout.write = function (chunk, encoding, callback) {
    const data = chunk.toString();
    if ((data.includes('SessionEntry') || data.includes('Closing session') || data.includes('Bad MAC') || data.includes('Decrypted message') || data.includes('MessageCounterError')) && !data.includes('🚀') && !data.includes('✅') && !data.includes('🎙️')) {
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

if (!global.healingRetries) global.healingRetries = new Map(); 
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

global.saveSettings = async () => {
    try {
        if (!fs.existsSync(settingsFile)) return;
        const settings = fs.readJsonSync(settingsFile);
        await client.db("vinnieBot").collection("config").updateOne({ id: "main_config" }, { $set: settings }, { upsert: true });
        console.log("💾 Settings Backed up to Cloud");
    } catch (e) { }
};

async function startVinnieHub() {
    const authFolder = './auth_temp';
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);
    const credsPath = path.join(authFolder, 'creds.json');

    try {
        await client.connect();
        const dbConfig = await client.db("vinnieBot").collection("config").findOne({ id: "main_config" });
        if (dbConfig) {
            delete dbConfig._id; delete dbConfig.id;
            fs.writeJsonSync(settingsFile, dbConfig);
            console.log("📥 Settings Pulled from Cloud");
        }
    } catch (err) { }

    if (!fs.existsSync(credsPath)) {
        const sessionID = process.env.SESSION_ID;
        if (sessionID?.startsWith('VINNIE~')) {
            try {
                const sessionRecord = await client.db("vinnieBot").collection("sessions").findOne({ sessionId: sessionID });
                if (sessionRecord) {
                    const decryptedData = zlib.inflateSync(Buffer.from(sessionRecord.data, 'base64')).toString();
                    fs.writeFileSync(credsPath, decryptedData);
                    console.log("✅ SESSION HEALED");
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
        
        let settings = {};
        try { settings = fs.readJsonSync(settingsFile); } catch(e) { settings = { mode: 'public' }; }
        
        const sender = msg.key.participant || from;
        const isMe = msg.key.fromMe || sender.split('@')[0] === (process.env.OWNER_NUMBER || "254768666068");

        // --- 📊 LOGGING & DB LOGS ---
        if (!msg.key.fromMe) {
            console.log(`💬 [${from.endsWith('@g.us') ? 'GROUP' : 'PVT'}] ${msg.pushName}: ${textContent}`);
            try {
                await client.db("vinnieBot").collection("logs").insertOne({
                    name: msg.pushName || "User", phone: sender.split('@')[0],
                    message: textContent, group: from.endsWith('@g.us') ? "Group" : "Private", timestamp: new Date()
                });
            } catch (e) {}
        }

        // --- 👁️ STATUS VIEW ---
        if (from === 'status@broadcast') {
            if (statusCache.has(msg.key.id) || (Date.now() - connectionOpenTime) < 10000) return;
            statusCache.add(msg.key.id);
            console.log(`✨ Status Viewed: ${msg.pushName}`);
            await sock.readMessages([msg.key]);
            return;
        }

        if (settings.mode === 'private' && !isMe) return;

        const prefix = process.env.PREFIX || ".";
        const isCommand = textContent.startsWith(prefix);

        // --- 🔵 BLUE TICK (Works for Everyone) ---
        if (settings.bluetick) {
            await sock.readMessages([msg.key]);
        }

        // --- 🎙️ PRESENCE: RECORDING/TYPING (1 MINUTE) ---
        if (!msg.key.fromMe && settings.typingMode !== 'off') {
            const action = settings.alwaysRecording ? 'recording' : 'composing';
            console.log(`🎙️ Presence: ${action} in ${from}`);
            await sock.sendPresenceUpdate(action, from);
            // Extends recording for 1 minute (60s)
            setTimeout(() => sock.sendPresenceUpdate('paused', from), 60000);
        }

        // --- 🕹️ GAME ENGINE ---
        const currentGame = global.gamestate.get(from);
        if (currentGame && !isCommand) {
            const gameCmd = commands.get(currentGame.name);
            if (gameCmd?.handleMove) {
                await gameCmd.handleMove(sock, msg, textContent, currentGame);
                return;
            }
        }

        // --- 📂 MENU REDIRECTOR ---
        if (!isCommand && /^\d+$/.test(textContent.trim())) {
            const menuCmd = commands.get('menu');
            if (menuCmd) {
                await menuCmd.execute(sock, msg, [textContent.trim()], { prefix, from, sender, isMe, settings, commands });
                return;
            }
        }

        // --- 🛠️ COMMAND EXECUTION ---
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
                    await command.execute(sock, msg, args, { prefix, from, sender, isMe, settings, groupAdmins: admins, commands, logsCollection: client.db("vinnieBot").collection("logs") });
                } catch (err) { console.error(`Error [${cmdName}]:`, err.message); }
            }
        }

        // --- 🧱 WORKERS ---
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
            console.log("✅ VINNIE HUB: Connected & Encryption Synced");
        }
        if (u.connection === 'close' && u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            console.log("⚠️ Connection Lost: Healing Session...");
            setTimeout(() => startVinnieHub(), 3000);
        }
    });
}
startVinnieHub();
