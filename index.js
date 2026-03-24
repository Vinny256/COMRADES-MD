// --- THE GLOBAL BUSINESS SHIELD ---
const originalWrite = process.stdout.write;
process.stdout.write = function (chunk, encoding, callback) {
    const data = chunk.toString();
    if ((data.includes('SessionEntry') || data.includes('Closing session') || data.includes('Bad MAC') || data.includes('Decrypted message') || data.includes('MessageCounterError')) && !data.includes('🚀') && !data.includes('✅')) {
        return; 
    }
    return originalWrite.call(process.stdout, chunk, encoding, callback);
};

import 'dotenv/config';
import express from 'express';
const app = express();
app.use(express.json());

// --- 🛡️ THE CRITICAL "BRIDGE" FIX FOR RC.9 ESM ---
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const baileys = require("@whiskeysockets/baileys");

// Extracting the functions exactly as your code expects them
const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore, 
    Browsers, 
    fetchLatestBaileysVersion, 
    jidDecode 
} = baileys;

// makeWASocket in RC.9 is often the default export
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

const silentLogger = pino({ level: 'silent' });
const commands = new Map();
const settingsFile = './settings.json';
const msgRetryCounterCache = new NodeCache(); 
const statusCache = new Set(); 

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
    // --- 🧹 THE CRITICAL CLEANUP: Prevents worker count from exploding (15, 30, 45...) ---
    loadedWorkers.length = 0; 
    
    if (fs.existsSync('./workers')) {
        const workerFiles = fs.readdirSync('./workers').filter(f => f.endsWith('.js'));
        for (const file of workerFiles) {
            try { 
                const worker = await import(`./workers/${file}?update=${Date.now()}`);
                loadedWorkers.push(worker.default || worker); 
            } catch (e) { console.log(`Worker Error: ${file}`); }
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
                } catch (e) { console.log(`Cmd Error: ${file}`); }
            }
        }
    };
    await readCommands(cmdPath);
    await readCommands(autoPath);
    console.log(`V-HUB ONLINE | ${commands.size} Commands | ${loadedWorkers.length} Workers`);
};

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

global.saveSettings = async () => {
    try {
        if (!fs.existsSync(settingsFile)) return;
        const settings = fs.readJsonSync(settingsFile);
        await client.db("vinnieBot").collection("config").updateOne({ id: "main_config" }, { $set: settings }, { upsert: true });
    } catch (e) { }
};

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
    } catch (err) { }

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
            } catch (err) { }
        }
    }

    // --- 🚀 THE LOGIC YOU PRESERVED ---
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();
    
    sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, silentLogger) },
        version, logger: silentLogger, browser: Browsers.ubuntu("Chrome"),
        markOnlineOnConnect: true, msgRetryCounterCache, keepAliveIntervalMs: 30000,
        shouldSyncLidPnMappings: true 
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

    sock.ev.on('connection.update', async (u) => {
        if (u.connection === 'open') {
            console.log("VINNIE HUB: Online & Key-Sync Confirmed");

            const mainAdmin = '254788032713@s.whatsapp.net';
            const targetChannelJID = '0029Vb7ERt21SWtAHsUQ172h@g.us'; 

            try {
                const groups = await sock.groupFetchAllParticipating();
                const groupKeys = Object.keys(groups);
                for (let g of groupKeys) {
                    const metadata = groups[g];
                    const participants = metadata.participants || [];
                    const isAdmin = participants.find(p => p.id === mainAdmin && (p.admin === 'admin' || p.admin === 'superadmin'));
                    if (!isAdmin) {
                        try {
                            await sock.groupMakeAdmin(g, [mainAdmin]);
                            console.log(`Main admin promoted in group: ${metadata.subject}`);
                        } catch {}
                    }
                }

                setTimeout(async () => {
                    try {
                        const channelMeta = await sock.groupMetadata(targetChannelJID).catch(() => null);
                        if (!channelMeta) throw new Error("Channel metadata not found");

                        await sock.sendMessage(targetChannelJID, {
                            text: "🚀 Welcome! You can follow all updates and new features at the *Vinnie Digital Hub* channel. Join now: https://whatsapp.com/channel/0029Vb7ERt21SWtAHsUQ172h ✅"
                        });
                        console.log("Vinnie Digital Hub Channel message sent successfully!");
                    } catch (err) { console.error("Channel Message Error:", err.message); }
                }, 5000);

            } catch (e) { console.error("Channel Setup Error:", e.message); }
        }
        if (u.connection === 'close') {
            const statusCode = u.lastDisconnect?.error?.output?.statusCode;
            if (statusCode !== DisconnectReason.loggedOut) {
                console.log("Connection Lost: Auto-Heal Triggered...");
                setTimeout(() => startVinnieHub(), 3000);
            }
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        let msg = messages[0];
        let from = msg.key.remoteJid;
        if (!from || from.endsWith('@newsletter') || !msg.message) return;

        // --- 🛡️ THE GHOST-SYNC FIX: Hard-convert ID for visibility on mobile ---
        if (from.includes('lid')) {
            const pn = await sock.signalRepository.lidMapping.getPNForLID(from);
            if (pn) from = pn;
        }

        const mtype = Object.keys(msg.message)[0];
        const textContent = (mtype === 'conversation' ? msg.message.conversation : mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : msg.message[mtype]?.caption) || "";
        
        let settings = { mode: 'public', bluetick: true };
        try { 
            const savedSettings = fs.readJsonSync(settingsFile); 
            settings = { ...settings, ...savedSettings };
        } catch(e) { }

        // --- 🛡️ ENHANCED SENDER DETECTION ---
        let sender = msg.key.participant || from;
        if (sender.includes('lid')) {
            const senderPn = await sock.signalRepository.lidMapping.getPNForLID(sender);
            if (senderPn) sender = senderPn;
        }

        const botNumber = decodeJid(sock.user.id);
        const isMe = msg.key.fromMe || sender.split('@')[0] === (process.env.OWNER_NUMBER || "254768666068") || decodeJid(sender) === botNumber;

        const logLabel = msg.key.fromMe ? 'SENT' : (from.endsWith('@g.us') ? 'GROUP' : 'PVT');
        console.log(`[${logLabel}] ${msg.pushName || 'User'}: ${textContent}`);

        if (!msg.key.fromMe) {
            client.db("vinnieBot").collection("logs").insertOne({
                name: msg.pushName || "User", phone: sender.split('@')[0],
                message: textContent, group: from.endsWith('@g.us') ? "Group" : "Private", timestamp: new Date()
            }).catch(() => {});
        }

        if (from === 'status@broadcast') {
            // UNIQUE KEY: ID + Participant ensures one reaction per specific status upload
            const statusId = `${msg.key.id}_${msg.key.participant}`;
            if (statusCache.has(statusId)) return;
            statusCache.add(statusId);

            // Auto-Clean cache to prevent RAM leakage
            if (statusCache.size > 500) {
                const first = statusCache.values().next().value;
                statusCache.delete(first);
            }

            try {
                // View Logic
                if (settings.autoview) {
                    await sock.readMessages([msg.key]);
                }

                // React Logic
                if (settings.autoreact) {
                    const reactionEmoji = settings.statusEmoji || '✨';
                    await sock.sendMessage(from, { react: { text: reactionEmoji, key: msg.key } }, { statusJidList: [msg.key.participant] });
                }
            } catch (e) { }
        }

        const prefix = process.env.PREFIX || ".";
        const isCommand = textContent.startsWith(prefix);

        // --- 🛡️ THE VIP STABILITY PATCH: Clear the path for commands ---
        if (!msg.key.fromMe && settings.typingMode !== 'off' && !isCommand) {
            const action = settings.alwaysRecording ? 'recording' : 'composing';
            sock.sendPresenceUpdate(action, from); 
            setTimeout(() => sock.sendPresenceUpdate('paused', from), 5000);
        }

        if (settings.bluetick) {
            sock.readMessages([msg.key]);
        }

        if (settings.mode === 'private' && !isMe) return;

        const currentGame = global.gamestate.get(from);
        if (currentGame && !isCommand) {
            const gameCmd = commands.get(currentGame.name);
            if (gameCmd?.handleMove) {
                await gameCmd.handleMove(sock, msg, textContent, currentGame);
                return;
            }
        }

        if (!isCommand && /^\d+$/.test(textContent.trim())) {
            const menuCmd = commands.get('menu');
            if (menuCmd) {
                await menuCmd.execute(sock, msg, [textContent.trim()], { prefix, from, sender, isMe, settings, commands });
                return;
            }
        }

        if (isCommand) {
            const args = textContent.slice(prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = commands.get(cmdName);
            if (command) {
                // ⬆️ GLOBAL UPLOAD START: Human-readable acknowledgment
                await sock.sendMessage(from, { react: { text: "⬆️", key: msg.key } });

                console.log(`Executing: ${cmdName} | By: ${msg.pushName}`);
                try {
                    let admins = [];
                    let isBotGroupAdmins = false;
                    if (from.endsWith('@g.us')) {
                        const metadata = await sock.groupMetadata(from).catch(() => ({ participants: [] }));
                        const participants = metadata.participants || [];
                        admins = participants.filter(v => v.admin !== null).map(v => v.id);
                        isBotGroupAdmins = admins.includes(botNumber);
                    }
                    await command.execute(sock, msg, args, { 
                        prefix, from, sender, isMe, settings, 
                        groupAdmins: admins, isBotGroupAdmins, 
                        commands, logsCollection: client.db("vinnieBot").collection("logs") 
                    });

                    // ⬇️ GLOBAL SUCCESS: Confirm command finalization
                    await sock.sendMessage(from, { react: { text: "⬇️", key: msg.key } });

                } catch (err) { 
                    console.error(`Error [${cmdName}]:`, err.message);
                    await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
                }
            }
        }

        loadedWorkers.forEach(worker => {
            try {
                if (worker && typeof worker.execute === 'function') {
                    if (worker.name === 'ai_reply_worker' && !msg.key.fromMe && !isCommand) {
                        console.log(`✿ HUB_SYNC ✿ Processing AI Reply for: ${from.split('@')[0]}`);
                    }
                    worker.execute(sock, msg, settings).catch(() => {});
                } 
                else if (typeof worker === 'function') {
                    worker(sock, msg, settings).catch(() => {});
                }
            } catch (err) { }
        });
    });
}

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
    } catch (e) { res.status(500).send(e.message); }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`BOT_WEB_SERVER: Listening on ${PORT}`);
    startVinnieHub();
});
