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
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');

const silentLogger = pino({ level: 'silent' });
const commands = new Map();
const settingsFile = './settings.json';

if (!fs.existsSync(settingsFile)) {
    fs.writeJsonSync(settingsFile, { autoview: true, antilink: true, autoreact: true, typing: true, recording: false, antiviewonce: true });
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

    const credsPath = path.join(authFolder, 'creds.json');

    // --- 🛡️ SMART SESSION RECOVERY ---
    // Only write creds if they don't exist to prevent session reset lag
    if (!fs.existsSync(credsPath)) {
        console.log("📦 Initializing session from SESSION_ID...");
        const base64Data = process.env.SESSION_ID.split('VINNIE-SESSION~')[1];
        fs.writeFileSync(
            credsPath,
            Buffer.from(base64Data, 'base64').toString()
        );
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    
    const sock = makeWASocket({
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, silentLogger) 
        },
        printQRInTerminal: false,
        logger: silentLogger, 
        browser: ["Vinnie Hub", "Chrome", "1.0.0"],
        
        // --- 🚀 HIGH-PERFORMANCE FLAGS ---
        shouldSyncHistoryMessage: () => false, 
        syncFullHistory: false,
        markOnlineOnConnect: true,
        fireInitQueries: false,      
        maxMsgRetryCount: 1,         
        generateHighQualityLinkPreview: false,
        
        getMessage: async (key) => {
            return { conversation: 'V_Hub_Ignore' };
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const prefix = process.env.PREFIX || ".";
        
        const text = (msg.message.conversation || 
                      msg.message.extendedTextMessage?.text || 
                      msg.message.imageMessage?.caption || "").trim();

        const isCommand = text.startsWith(prefix);
        const isStatus = from === 'status@broadcast';

        if (!isStatus && !isCommand) return;

        try {
            const settings = fs.readJsonSync(settingsFile);

            try {
                const handler = require('./events/handler');
                await handler.execute(sock, msg, settings);
            } catch (e) { }

            if (isCommand) {
                const messageTimestamp = msg.messageTimestamp;
                const currentTimestamp = Math.floor(Date.now() / 1000);
                if (currentTimestamp - messageTimestamp > 30) return;

                const args = text.slice(prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                
                const command = commands.get(commandName);
                if (command) {
                    if (settings.typing) await sock.sendPresenceUpdate('composing', from);
                    else if (settings.recording) await sock.sendPresenceUpdate('recording', from);

                    console.log(`[ EXEC ] ${commandName} from ${msg.pushName || from}`);
                    await sock.readMessages([msg.key]);

                    if (settings.typing || settings.recording) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        await sock.sendPresenceUpdate('paused', from);
                    }

                    await command.execute(sock, msg, args, { prefix, commands, from });
                }
            }
        } catch (err) {
            console.error("┃ ❌ UPSERT_ERROR:", err.message);
        }
    });

    sock.ev.on('connection.update', (u) => { 
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            console.clear();
            console.log("\n📡 Vinnie Hub Active!");
            console.log("┃ Infinite Impact - Smart Session Recovery Active\n");
            
            try {
                const automation = require('./events/automation');
                automation.startBioRotation(sock);
            } catch (e) { }
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startVinnieHub();
        }
    });
}

startVinnieHub();