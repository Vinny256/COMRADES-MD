module.exports = {
    name: "owner",
    category: "general",
    desc: "V_HUB: Meet the Founder",
    async execute(sock, msg, args, { from }) {
        // --- 💎 FOUNDER IDENTITY ---
        const ownerName = "Vinnie Digital Hub";
        const ownerLocation = "Kiambu, Kenya 🇰🇪";
        const institution = "University of Embu (UoE)";
        const contact = "254768666068";

        // Best React Emoji for Identity
        await sock.sendMessage(from, { react: { text: "👑", key: msg.key } });

        // --- ✿ VINNIE HUB STYLING ✿ ---
        const vcard = 'BEGIN:VCARD\n' // Creating a clickable contact card
            + 'VERSION:3.0\n' 
            + `FN:${ownerName}\n` 
            + `ORG:Vinnie Digital Hub;\n` 
            + `TEL;type=CELL;type=VOICE;waid=${contact}:${contact}\n` 
            + 'END:VCARD';

        const bio = `┏━━━━━ ✿ *VINNIE HUB FOUNDER* ✿ ━━━━━┓
┃
┃  👤 *Name:* ${ownerName}
┃  🇰🇪 *Origin:* ${ownerLocation}
┃  🎓 *Studies:* ${institution}
┃  🛠️ *Status:* Full-Stack Developer
┃
┃  👋 *About:* ┃  _Developing digital solutions from the_ 
┃  _heart of Embu to the rest of Kenya._
┃
┃  📞 *Contact:* https://wa.me/${contact}
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛`;

        // Sending the Bio message first
        await sock.sendMessage(from, { 
            text: bio, 
            mentions: [contact + '@s.whatsapp.net'] 
        }, { quoted: msg });

        // Sending the Clickable V-Card right after
        await sock.sendMessage(from, { 
            contacts: { 
                displayName: ownerName, 
                contacts: [{ vcard }] 
            } 
        }, { quoted: msg });
    }
};
