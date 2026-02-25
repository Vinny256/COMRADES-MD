const { DisconnectReason } = require("@whiskeysockets/baileys");

module.exports = async (u, startVinnieHub) => {
    const { connection, lastDisconnect } = u;
    if (connection === 'open') {
        global.connectionOpenTime = Date.now();
        console.log("\n📡 Vinnie Hub Active | Grid Sync Online");
    }
    if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        if (reason !== DisconnectReason.loggedOut) {
            console.log("🔄 Connection lost. Reconnecting...");
            setTimeout(() => startVinnieHub(), 3000);
        }
    }
};
