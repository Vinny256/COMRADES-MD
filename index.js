require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys");
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');

const commands = new Map();

// --- MODULAR CONFIG ---
const settingsFile = './settings.json';
if (!fs.existsSync(settingsFile)) {
    fs.writeJsonSync(settingsFile, { autoview: true, antilink: true, autoreact: true, typing: true, recording: false });
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
        // 🛡️ SILENCED SIGNAL STORE - Stops "SessionEntry" logs
        auth: { 
            creds: state.creds, 
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })) 
        },
        printQRInTerminal: false,
        logger: pino({ level: 'fatal' }), // 🔕 Total Silence on Socket
        browser: ["Vinnie Hub", "Chrome", "1.0.0"],
        
        // --- 🛡️ THE BIG ACCOUNT STABILITY SHIELD ---
        shouldSyncHistoryMessage: () => false, 
        syncFullHistory: false,
        markOnlineOnConnect: true,
        getMessage: async (key) => {
            return { conversation: 'V_Hub_Ignore' };
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        const msg = messages[0];
        if (!msg.message) return;
        if (msg.key && msg.key.remoteJid === 'status@broadcast') return;

        const from = msg.key.remoteJid;
        
        try {
            const settings = fs.readJsonSync(settingsFile);

            // --- DYNAMIC BACKGROUND HANDLER ---
            try {
                const handler = require('./events/handler');
                await handler.execute(sock, msg, settings);
            } catch (e) { /* Silently skip */ }

            const messageTimestamp = msg.messageTimestamp;
            const currentTimestamp = Math.floor(Date.now() / 1000);
            if (currentTimestamp - messageTimestamp > 60) return;

            const text = (msg.message.conversation || 
                          msg.message.extendedTextMessage?.text || 
                          msg.message.imageMessage?.caption || "").trim();
            
            const prefix = process.env.PREFIX || ".";
            if (!text.startsWith(prefix)) return;

            const args = text.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            
            const command = commands.get(commandName);
            if (command) {
                // --- 🎤 RECORDING / TYPING HANDLER ---
                if (settings.typing) {
                    await sock.sendPresenceUpdate('composing', from);
                } else if (settings.recording) {
                    await sock.sendPresenceUpdate('recording', from);
                }

                console.log(`[ EXEC ] ${commandName} from ${msg.pushName || from}`);
                
                await sock.readMessages([msg.key]);

                if (settings.typing || settings.recording) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    await sock.sendPresenceUpdate('paused', from);
                }

                await command.execute(sock, msg, args, { prefix, commands, from });
            }
        } catch (err) {
            console.error("┃ ❌ UPSERT_ERROR:", err.message);
        }
    });

    sock.ev.on('connection.update', (u) => { 
        const { connection, lastDisconnect } = u;
        if (connection === 'open') {
            console.log("📡 Vinnie Hub Active!");
            try {
                const automation = require('./events/automation');
                automation.startBioRotation(sock);
            } catch (e) {
                console.log("⚠️ Automation file not found.");
            }
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startVinnieHub();
        }
    });
}

startVinnieHub();