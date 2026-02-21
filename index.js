// --- 🛡️ THE GLOBAL BUSINESS SHIELD (NUCLEAR SILENCE) ---
const originalWrite = process.stdout.write;
process.stdout.write = function (chunk, encoding, callback) {
    const data = chunk.toString();
    if (data.includes('SessionEntry') || data.includes('Closing session') || data.includes('Bad MAC') || data.includes('Decrypted message')) {
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
    Browsers 
} = require("@whiskeysockets/baileys");
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const zlib = require('zlib'); 
const { MongoClient } = require("mongodb"); 

const silentLogger = pino({ level: 'silent' });
const commands = new Map();
const settingsFile = './settings.json';

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri || "");

if (!fs.existsSync(settingsFile)) {
    fs.writeJsonSync(settingsFile, { autoview: true, antilink: true, autoreact: true, typing: true, recording: false, antiviewonce: true });
}

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

    // --- 🛡️ SMART SESSION RECOVERY ---
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
        markOnlineOnConnect: false, 
        fireInitQueries: false,      
        maxMsgRetryCount: 1,         
        generateHighQualityLinkPreview: false,
        getMessage: async (key) => { return { conversation: 'V_Hub_Ignore' }; }
    });

    // --- 🛡️ STABILITY FIX: SYNC BACK TO MONGO ---
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
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const prefix = process.env.PREFIX || ".";
        const settings = fs.readJsonSync(settingsFile);

        if (from === 'status@broadcast') {
            await sock.readMessages([msg.key]);
            return; 
        }

        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "").trim();
        const isCommand = text.startsWith(prefix);

        // --- 🚨 TYPING LOGIC (PRESERVED) ---
        if (settings.typing) {
            try {
                await sock.presenceSubscribe(from);
                await sock.sendPresenceUpdate('composing', from);
                await new Promise(resolve => setTimeout(resolve, 10000));
                await sock.sendPresenceUpdate('paused', from);
            } catch (e) { }
        }

        await sock.readMessages([msg.key]);

        try {
            const handler = require('./events/handler');
            await handler.execute(sock, msg, settings);

            if (isCommand) {
                const args = text.slice(prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                const command = commands.get(commandName);
                if (command) {
                    await command.execute(sock, msg, args, { prefix, commands, from });
                }
            }
        } catch (err) { }
    });

    // --- 🧹 SAFE STORAGE OPTIMIZATION ---
    setInterval(async () => {
        const authFolder = './auth_temp';
        try {
            const files = fs.readdirSync(authFolder);
            for (const file of files) {
                // IMPORTANT: We keep 'creds.json' AND 'app-state' keys. 
                // Deleting app-state causes the '1-hour disconnect' you're seeing.
                if (file !== 'creds.json' && !file.includes('app-state')) {
                    fs.removeSync(path.join(authFolder, file));
                }
            }
        } catch (err) { }
    }, 1000 * 60 * 60 * 2);

    sock.ev.on('connection.update', async (u) => { 
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            console.clear();
            console.log("\n📡 Vinnie Hub Active");
            try {
                const automation = require('./events/automation');
                automation.startBioRotation(sock);
            } catch (e) { }
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startVinnieHub();
            }
        }
    });
}

startVinnieHub();