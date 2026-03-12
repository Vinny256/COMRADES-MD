// --- 🛡️ THE GLOBAL BUSINESS SHIELD ---
const originalWrite = process.stdout.write;
process.stdout.write = function (chunk, encoding, callback) {
    const data = chunk.toString();
    if ((data.includes('SessionEntry') || data.includes('Closing session') || data.includes('Bad MAC') || data.includes('Decrypted message') || data.includes('MessageCounterError')) && !data.includes('🚀') && !data.includes('✅')) {
        return; 
    }
    return originalWrite.call(process.stdout, chunk, encoding, callback);
};

require('dotenv').config();
const express = require('express'); // Added for Web Mode
const app = express(); // Added for Web Mode
app.use(express.json()); // Added for Web Mode

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
if (!global.activeGames) global.activeGames = new Map(); 
if (!global.gamestate) global.gamestate = new Map(); 

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
                        if (command.name) {
                            if (Array.isArray(command.name)) command.name.forEach(n => commands.set(n, command));
                            else commands.set(command.name, command);
                        }
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
    } catch (e) { }
};

let sock; // Export sock globally for the listener

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

    // --- 🛠️ SESSION HEALING & RECOVERY ---
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
    
    sock = makeWASocket({
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

        // --- 📊 ASYNC LOGGING ---
        if (!msg.key.fromMe) {
            console.log(`💬 [${from.endsWith('@g.us') ? 'GROUP' : 'PVT'}] ${msg.pushName}: ${textContent}`);
            client.db("vinnieBot").collection("logs").insertOne({
                name: msg.pushName || "User", phone: sender.split('@')[0],
                message: textContent, group: from.endsWith('@g.us') ? "Group" : "Private", timestamp: new Date()
            }).catch(() => {});
        }

    
// --- 👁️ STATUS AUTO-VIEW & REACT ---
if (from === 'status@broadcast') {
    if (statusCache.has(msg.key.id)) return;
    statusCache.add(msg.key.id);

    try {
        // Force the 'Read Receipt' so your name appears on the viewer list
        await sock.readMessages([msg.key]);

        // Send the reaction (The '✨' can be changed to any emoji)
        // statusJidList is required for statuses to register the reaction correctly
        await sock.sendMessage(from, {
            react: { text: '✨', key: msg.key }
        }, { statusJidList: [msg.key.participant] });

        console.log(`✅ Status Viewed & Reacted: ${msg.pushName || 'User'}`);
    } catch (e) {
        console.error("❌ Status Error:", e.message);
    }
    return;
}

        // --- 🎙️ INSTANT PRESENCE (60s Nuclear Mode) ---
        if (!msg.key.fromMe && settings.typingMode !== 'off') {
            const action = settings.alwaysRecording ? 'recording' : 'composing';
            sock.sendPresenceUpdate(action, from); 
            setTimeout(() => sock.sendPresenceUpdate('paused', from), 60000);
        }

        // --- 🔵 INSTANT BLUE TICK ---
        if (settings.bluetick) {
            sock.readMessages([msg.key]);
        }

        if (settings.mode === 'private' && !isMe) return;

        const prefix = process.env.PREFIX || ".";
        const isCommand = textContent.startsWith(prefix);

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

        // --- 🛠️ INSTANT COMMANDS ---
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

        // --- 🧱 SMART PARALLEL WORKERS ---
        loadedWorkers.forEach(worker => {
            if (typeof worker === 'function') {
                worker(sock, msg, settings).catch(e => {});
            } else if (worker && typeof worker.execute === 'function') {
                worker.execute(sock, msg, settings).catch(e => {});
            }
        });
    });

    sock.ev.on('connection.update', (u) => {
        if (u.connection === 'open') {
            connectionOpenTime = Date.now();
            console.log("✅ VINNIE HUB: Online & Key-Sync Confirmed");
        }
        if (u.connection === 'close') {
            const statusCode = u.lastDisconnect?.error?.output?.statusCode;
            if (statusCode !== DisconnectReason.loggedOut) {
                console.log("⚠️ Bad MAC or Desync: Auto-Heal Triggered...");
                setTimeout(() => startVinnieHub(), 3000);
            }
        }
    });
}

// --- 📡 THE WEB LISTENER (FOR MPESA NOTIFY) ---
app.post('/v_hub_notify', async (req, res) => {
    const { jid, text } = req.body;
    if (req.headers['x-vhub-secret'] !== process.env.API_SECRET) return res.sendStatus(403);
    
    try {
        if (sock) {
            await sock.sendMessage(jid, { text: text });
            res.status(200).send("OK");
        } else {
            res.status(503).send("Sock Offline");
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`┃ 📡 BOT_WEB_SERVER: Listening on ${PORT}`);
    startVinnieHub();
});
