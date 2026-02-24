module.exports = {
    name: "admins",
    category: "group",
    desc: "Tag all administrators",
    async execute(sock, msg, args, { from }) {
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants.filter(p => p.admin).map(p => p.id);

        await sock.sendMessage(from, { react: { text: "👮", key: msg.key } });

        let adminList = `┏━━━━━ ✿ *GROUP STAFF* ✿ ━━━━━┓\n┃\n`;
        
        for (let admin of admins) {
            adminList += `┃ 🛡️ @${admin.split('@')[0]}\n`;
        }
        
        adminList += `┃\n┃ 👉 *Total Admins:* ${admins.length}\n┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        await sock.sendMessage(from, { 
            text: adminList, 
            mentions: admins 
        });
    }
};