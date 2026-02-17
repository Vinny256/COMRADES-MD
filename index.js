require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const express = require('express'); // Added Express

const commands = new Map();

// --- MODULAR CONFIG ---
const settingsFile = './settings.json';
if (!fs.existsSync(settingsFile)) {
    fs.writeJsonSync(settingsFile, { autoview: true, antilink: true, autoreact: true });
}

const loadCommands = () => {
    const folders = fs.readdirSync(path.join(__dirname, 'commands'));
    for (const folder of folders) {
        const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./commands/${folder}/${file}`);
            commands.set(command.name, command);
        }
    }
    console.log(`✅ Loaded ${commands.size} Commands`);
};

async function startVinnieHub() {
    loadCommands();
    
    const authFolder = './auth_temp';
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder);
    const base64Data = process.env.SESSION_ID.split('VINNIE-SESSION~')[1];
    fs.writeFileSync(path.join(authFolder, 'creds.json'), Buffer.from(base64Data, 'base64').toString());

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const sock = makeWASocket({
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ["Vinnie Hub", "Chrome", "1.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const settings = fs.readJsonSync(settingsFile);

        // --- DYNAMIC BACKGROUND HANDLER ---
        try {
            const handler = require('./events/handler');
            await handler.execute(sock, msg, settings);
        } catch (e) {
            // Silently skip if handler isn't ready
        }

        // --- ANTI-SPAM / ANTI-BAN LOGIC ---
        const messageTimestamp = msg.messageTimestamp;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const diff = currentTimestamp - messageTimestamp;
        if (diff > 60) return;

        const text = (msg.message.conversation || 
                      msg.message.extendedTextMessage?.text || 
                      msg.message.imageMessage?.caption || "").trim();
        
        const prefix = process.env.PREFIX || ".";
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        const command = commands.get(commandName);
        if (command) {
            console.log(`[ EXEC ] ${commandName} from ${msg.pushName || from}`);
            await sock.readMessages([msg.key]);
            await command.execute(sock, msg, args, { prefix, commands, from });
        }
    });

    sock.ev.on('connection.update', (u) => { 
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            console.log("📡 Vinnie Hub Active!");
            
            // --- AUTOMATION TRIGGER ---
            try {
                const automation = require('./events/automation');
                automation.startBioRotation(sock);
            } catch (e) {
                console.log("⚠️ Automation file not found in events folder.");
            }
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startVinnieHub();
        }
    });

    // --- HEROKU WEB BINDING (Fixes 503 H14) ---
    // This part allows the Proxy to talk to the Bot
    const app = express();
    app.use(express.json());
    
    // Webhook for M-PESA Notifications from Proxy
    app.post('/v_hub_notify', async (req, res) => {
        const { jid, text } = req.body;
        const secret = req.headers['x-vhub-secret'];
        if (secret !== "Vinnie_Bot_Wallet") return res.sendStatus(403);
        try {
            await sock.sendMessage(jid, { text: text });
            res.sendStatus(200);
        } catch (e) {
            res.sendStatus(500);
        }
    });

    app.get('/', (req, res) => res.send('VINNIE_DIGITAL_HUB_ALIVE'));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`┃ ✿ WEB_SERVER: Listening on Port ${PORT}`);
    });
}

startVinnieHub();