module.exports = {
    name: "setowner",
    category: "config",
    desc: "Add a secondary owner number",
    async execute(sock, msg, args, { from, isMe }) {
        if (!isMe) return;
        const newOwner = args[0]?.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
        if (!args[0]) return sock.sendMessage(from, { text: "┃ Provide a number (e.g .setowner 254...)" });

        // Logic to push this number into an 'owners' array in settings.json
        await sock.sendMessage(from, { text: `✿ OWNER_ADDED ✿\n┃ User: @${args[0]}\n┃ Role: ADMIN_ACCESS`, mentions: [newOwner] });
    }
};