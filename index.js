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
const config = require('./config');
const { taskQueue, processQueue } = require('./helpers/queue');

const silentLogger = pino({ level: 'silent' });
const commands = new Map();
const statusCache = new Set(); 
const msgRetryCounterCache = new NodeCache(); 

// --- 🧠 MEMORY TRACKERS (RESTORED) ---
global.healingRetries = global.healingRetries || new Map(); 
global.lockedContacts = global.lockedContacts || new Set(); 
global.activeGames = global.activeGames || new Map(); 
global.gamestate = global.gamestate || new Map(); 
let connectionOpenTime = 0;

// --- 🧱 DYNAMIC LOADERS ---
const loadedWorkers = [];
const loadAll = () => {
    // Workers
    fs.readdirSync('./workers').forEach(file => {
        try { loadedWorkers.push(require(`./workers/${file}`)); } catch (e) {}
    });
    // Commands
    const folders = fs.readdirSync('./commands');
    for (const folder of folders) {
        fs.readdirSync(`./commands/${folder}`).forEach(file => {
            const cmd = require(`./commands/${folder}/${file}`);
            commands.set(cmd.name, cmd);
        });
    }
};
loadAll();

async function startVinnieHub() {
    const client = new MongoClient(config.mongoUri || "");
    const authFolder = './auth_temp';
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);
    const credsPath = path.join(authFolder, 'creds.json');

    // --- 📥 SESSION RECOVERY (RESTORED) ---
    if (!fs.existsSync(credsPath) && config.sessionId?.startsWith('VINNIE~')) {
        try {
            await client.connect(); 
            const sessionRecord = await client.db("vinnieBot").collection("sessions").findOne({ sessionId: config.sessionId });
            if (sessionRecord) {
                const decryptedData = zlib.inflateSync(Buffer.from(sessionRecord.data, 'base64')).toString();
                fs.writeFileSync(credsPath, decryptedData);
                console.log("✅ [SYSTEM] Session recovered!");
            }
        } catch (err) { }
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, silentLogger) },
        version, logger: silentLogger, browser: Browsers.ubuntu("Chrome"),
        markOnlineOnConnect: true, msgRetryCounterCache, keepAliveIntervalMs: 30000
    });

    sock.ev.on('creds.update', async () => {
        await saveCreds(); 
        try {
            const credsData = fs.readFileSync(credsPath);
            const compressed = zlib.deflateSync(credsData).toString('base64');
            await client.db("vinnieBot").collection("sessions").updateOne(
                { sessionId: config.sessionId },
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

        const isMe = msg.key.fromMe || msg.key.participant?.split('@')[0] === config.ownerNumber || from.split('@')[0] === config.ownerNumber;
        if (config.mode === 'private' && !isMe) return;

        const mtype = Object.keys(msg.message)[0];
        const text = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        const isCommand = text.startsWith(config.prefix);

        // --- 🔵 BLUE TICK & PRESENCE ---
        if (config.bluetick) await sock.readMessages([msg.key]);
        if (!isMe && !isCommand) {
            const action = config.alwaysRecording ? 'recording' : 'composing';
            await sock.sendPresenceUpdate(action, from);
            setTimeout(() => sock.sendPresenceUpdate('paused', from), 10000);
        }

        // --- 🛠️ COMMANDS ---
        if (isCommand) {
            const args = text.slice(config.prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = commands.get(cmdName);
            if (command) {
                try {
                    let admins = [];
                    if (from.endsWith('@g.us')) {
                        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
                        admins = (metadata.participants || []).filter(v => v.admin !== null).map(v => v.id);
                    }
                    await command.execute(sock, msg, args, { prefix: config.prefix, isMe, settings: config, groupAdmins: admins });
                } catch (e) { }
            }
        }

        // --- 🧱 WORKERS (RAM SAVER QUEUE) ---
        loadedWorkers.forEach(worker => {
            taskQueue.push(async () => {
                try { await worker(sock, msg, config); } catch (e) {}
            });
        });
        processQueue();
    });

    sock.ev.on('connection.update', (u) => {
        if (u.connection === 'open') connectionOpenTime = Date.now();
        if (u.connection === 'close' && u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            setTimeout(() => startVinnieHub(), 3000);
        }
        console.log("📡 Vinnie Hub Status Update:", u.connection || "waiting");
    });
}

process.on('uncaughtException', (err) => {
    if (err.message.includes('Bad MAC')) return;
    console.error("⚠️ Supervisor caught crash:", err.message);
});

startVinnieHub();
