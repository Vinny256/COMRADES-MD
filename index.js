// --- THE GLOBAL BUSINESS SHIELD ---
// Removed silent filter to log everything
import 'dotenv/config';
import express from 'express';
const app = express();
app.use(express.json());

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
import { MongoClient } from "mongodb"; 
import NodeCache from "node-cache"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = pino({ level: 'debug' }); // 🔹 full logging
const commands = new Map();
const settingsFile = './settings.json';
const msgRetryCounterCache = new NodeCache(); 

// ✅ In-memory message store for getMessage handler
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
            } catch (e) { console.error(`Worker Error: ${file}`, e); }
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
                } catch (e) { console.error(`Cmd Error: ${file}`, e); }
            }
        }
    };
    await readCommands(cmdPath);
    await readCommands(autoPath);
    console.log(`V-HUB ONLINE | ${commands.size} Commands | ${loadedWorkers.length} Workers`);
};

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");
global.dbClient = client; 

global.saveSettings = async () => {
    try {
        if (!fs.existsSync(settingsFile)) return;
        const settings = fs.readJsonSync(settingsFile);
        await client.db("vinnieBot").collection("config").updateOne({ id: "main_config" }, { $set: settings }, { upsert: true });
    } catch (e) { console.error("Save Settings Error:", e); }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let sock;

async function startVinnieHub() {
    await loadResources(); 

    const authFolder = './auth_temp';
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);
    const credsPath = path.join(authFolder, 'creds.json');

    try {
        await client.connect();
        const dbConfig = await client.db("vinnieBot").collection("config").findOne({ id: "main_config" });
        if (dbConfig) {
            delete dbConfig._id; delete dbConfig.id;
            fs.writeJsonSync(settingsFile, dbConfig);
            console.log("Settings Pulled from Cloud");
        }
    } catch (err) { console.error("Mongo Pull Error:", err); }

    if (!fs.existsSync(credsPath)) {
        const sessionID = process.env.SESSION_ID;
        if (sessionID?.startsWith('VINNIE~')) {
            try {
                const sessionRecord = await client.db("vinnieBot").collection("sessions").findOne({ sessionId: sessionID });
                if (sessionRecord) {
                    const decryptedData = zlib.inflateSync(Buffer.from(sessionRecord.data, 'base64')).toString();
                    fs.writeFileSync(credsPath, decryptedData);
                    console.log("SESSION HEALED");
                }
            } catch (err) { console.error("Session Heal Error:", err); }
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
        keepAliveIntervalMs: 30000,
        syncFullHistory: true, 
        shouldSyncLidPnMappings: true,
        getMessage: async (key) => messageStore.get(`${key.remoteJid}-${key.id}`) || { conversation: '' }
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
        } catch (e) { console.error("Creds Update Error:", e); }
    });

    sock.ev.on('connection.update', async (u) => {
        console.log("CONNECTION UPDATE:", u.connection, u.lastDisconnect ? `(Last Disconnect: ${u.lastDisconnect.error?.output?.statusCode})` : '');
        if (u.connection === 'open') {
            console.log("VINNIE HUB: Online & Key-Sync Confirmed");
            if (sock.user?.id) {
                sock.ev.emit('presence.update', { id: sock.user.id, presences: { [sock.user.id]: { lastKnownPresence: 'available' } } });
            }
        }
        if (u.connection === 'close') {
            const code = u.lastDisconnect?.error?.output?.statusCode;
            console.log("Disconnected with status:", code);
            if (code !== DisconnectReason.loggedOut) {
                console.log("Connection Lost: Auto-Heal Triggered...");
                setTimeout(() => startVinnieHub(), 3000);
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        console.log("MESSAGES UPSERT:", type, messages.map(m => m.key.remoteJid + ":" + Object.keys(m.message || {}).join(',')));
        if (!['notify','append'].includes(type)) return;
        
        for (const m of messages) {
            if (!m.message) continue;
            const keyStr = `${m.key.remoteJid}-${m.key.id}`;
            messageStore.set(keyStr, m.message);
            if (messageStore.size > 500) messageStore.delete(messageStore.keys().next().value);
        }

        const msg = messages[0];
        const from = msg.key.remoteJid;
        const mtype = Object.keys(msg.message)[0];
        const textContent = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        console.log(`RECEIVED MESSAGE FROM: ${from} | Type: ${mtype} | Text: "${textContent}"`);

        // --- LOAD SETTINGS ---
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
            const args = textContent.slice(prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = commands.get(cmdName);
            if (command) {
                try {
                    console.log(`EXECUTING COMMAND: ${cmdName} FROM: ${from} ARGS: ${args}`);
                    await sock.sendMessage(from, { react: { text: '⬆️', key: msg.key } }); // processing
                    await command.execute(sock, msg, args, { prefix, from, sender, isMe, settings, commands, logsCollection: client.db("vinnieBot").collection("logs") });
                    await sock.sendPresenceUpdate('available', from);
                    await sock.readMessages([msg.key]);
                    await sock.sendMessage(from, { react: { text: '⬇️', key: msg.key } }); // completed
                    console.log(`COMMAND COMPLETED: ${cmdName} FROM: ${from}`);
                } catch (err) {
                    console.error(`COMMAND ERROR [${cmdName}]:`, err);
                    await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }); // error
                }
            }
        }

        loadedWorkers.forEach(worker => {
            try {
                if (worker?.execute) worker.execute(sock, msg, settings).catch(err => console.error("Worker Execution Error:", err));
                else if (typeof worker === 'function') worker(sock, msg, settings).catch(err => console.error("Worker Function Error:", err));
            } catch (err) { console.error("Worker Loop Error:", err); }
        });
    });

    sock.ev.on('messages.update', (upd) => console.log("MESSAGE UPDATE:", upd));
    sock.ev.on('messages.delete', (del) => console.log("MESSAGE DELETE:", del));
    sock.ev.on('message-receipt.update', (r) => console.log("MESSAGE RECEIPT UPDATE:", r));
    sock.ev.on('presence.update', (p) => console.log("PRESENCE UPDATE:", p));
    sock.ev.on('chats.update', (c) => console.log("CHATS UPDATE:", c));
    sock.ev.on('contacts.update', (c) => console.log("CONTACTS UPDATE:", c));
}

app.post('/v_hub_notify', async (req, res) => {
    console.log("VHUB_NOTIFY HIT:", req.body);
    if (req.headers['x-vhub-secret'] !== process.env.API_SECRET) return res.sendStatus(403);
    try {
        if (sock) {
            await sock.sendMessage(req.body.jid, { text: req.body.text });
            console.log("SENT MESSAGE VIA VHUB_NOTIFY:", req.body.jid, req.body.text);
            res.status(200).send("OK");
        } else res.status(503).send("Sock Offline");
    } catch (e) { 
        console.error("v_hub_notify error:", e);
        res.status(500).send(e.message); 
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`BOT_WEB_SERVER: Listening on ${PORT}`);
    startVinnieHub();
});
