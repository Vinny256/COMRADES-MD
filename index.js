// --- 🛡️ THE GLOBAL BUSINESS SHIELD (NUCLEAR SILENCE) ---
// This intercepts and deletes session logs at the process level before they lag Heroku
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

// --- 🛡️ THE GAG ORDER ---
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
    // Clean start: Wipes old corrupted session files on every Heroku deploy
    if (fs.existsSync(authFolder)) fs.emptyDirSync(authFolder);
    else fs.mkdirSync(authFolder);

    const base64Data = process.env.SESSION_ID.split('VINNIE-SESSION~')[1];
    fs.writeFileSync(path.join(authFolder, 'creds.json'), Buffer.from(base64Data, 'base64').toString());

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    
    const sock = makeWASocket({
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, silentLogger) 
        },
        printQRInTerminal: false,
        logger: silentLogger, 
        browser: ["Vinnie Hub", "Chrome", "1.0.0"],
        
        // --- 🚀 THE BUSINESS SPEED PATCH (INSTANT RESPONSE) ---
        shouldSyncHistoryMessage: () => false, 
        syncFullHistory: false,
        markOnlineOnConnect: true,
        fireInitQueries: false,      // 🛑 CRITICAL: Stops bot from asking for old messages on boot
        maxMsgRetryCount: 1,         // Stops the "Bad MAC" retry loop
        linkPreviewHighQuality: false, 
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
        
        // --- 🛠️ BUSINESS SELECTIVE LISTENER ---
        const text = (msg.message.conversation || 
                      msg.message.extendedTextMessage?.text || 
                      msg.message.imageMessage?.caption || "").trim();

        const isCommand = text.startsWith(prefix);
        const isStatus = from === 'status@broadcast';

        // 🛑 Stop processing immediately if it's not a command or status
        if (!isStatus && !isCommand) return;

        try {
            const settings = fs.readJsonSync(settingsFile);

            // --- 1. DYNAMIC BACKGROUND HANDLER ---
            try {
                const handler = require('./events/handler');
                await handler.execute(sock, msg, settings);
            } catch (e) { }

            // --- 2. COMMAND EXECUTION ---
            if (isCommand) {
                const messageTimestamp = msg.messageTimestamp;
                const currentTimestamp = Math.floor(Date.now() / 1000);
                // Ignore commands older than 30 seconds to prevent "lag-execution"
                if (currentTimestamp - messageTimestamp > 30) return;

                const args = text.slice(prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                
                const command = commands.get(commandName);
                if (command) {
                    if (settings.typing) {
                        await sock.sendPresenceUpdate('composing', from);
                    } else if (settings.recording) {
                        await sock.sendPresenceUpdate('recording', from);
                    }

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
            console.log("┃ Infinite Impact - Business Engine Optimized\n");
            
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