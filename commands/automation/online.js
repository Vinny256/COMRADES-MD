module.exports = {
    name: "online",
    category: "automation",
    desc: "V_HUB: Presence & Stealth Control",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        // 🔒 HARD LOCK: NONE-OWNER FALLBACK
        if (!isMe) {
            // 1. React to the intruder
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            
            // 2. Send the Restricted Access Reply
            return await sock.sendMessage(from, { 
                text: `╭─── ~✾~ *V_HUB SECURITY* ~✾~ ───\n` +
                      `│\n` +
                      `│ ⚠️ *Alert:* Unauthorized Access\n` +
                      `│ 👤 *User:* Restricted\n` +
                      `│ 🛡️ *Status:* Founder Only Command\n` +
                      `│\n` +
                      `╰─── ~✾~ *Infinite Impact* ~✾~ ───` 
            }, { quoted: msg });
        }

        const mode = args[0]?.toLowerCase();
        const hubName = "VINNIE STEALTH HUB";

        try {
            let statusText = "";
            let reaction = "🛡️";
            
            if (mode === 'on') {
                await sock.sendPresenceUpdate('available');
                statusText = "🟢 *ACTIVE:* Visible to all.";
            } else if (mode === 'off' || mode === 'ghost') {
                await sock.sendPresenceUpdate('unavailable');
                statusText = "👻 *GHOST:* Last seen hidden.";
            } else {
                reaction = "🔓";
                const statusMenu = `╭─── ~✾~ *${hubName}* ~✾~ ───\n` +
                                 `│\n` +
                                 `│  ⚙️ *Usage:* ${prefix}online [mode]\n` +
                                 `│\n` +
                                 `│  ◦ *${prefix}online on* \n` +
                                 `│    └─ Status: Visible Online\n` +
                                 `│\n` +
                                 `│  ◦ *${prefix}online ghost* \n` +
                                 `│    └─ Status: Hide Presence\n` +
                                 `│\n` +
                                 `├──────────────────────────\n` +
                                 `│  💡 _Read & Typing still work!_\n` +
                                 `╰─── ~✾~ *Vinnie Hub* ~✾~ ───`;
                
                await sock.sendMessage(from, { react: { text: reaction, key: msg.key } });
                return await sock.sendMessage(from, { text: statusMenu }, { quoted: msg });
            }

            // --- SUCCESS RESPONSE ---
            const response = `╭─── ~✾~ *SYSTEM UPDATE* ~✾~ ───\n│\n│  ✅ ${statusText}\n│\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───`;
            
            await sock.sendMessage(from, { react: { text: reaction, key: msg.key } });
            await sock.sendMessage(from, { text: response }, { quoted: msg });

        } catch (e) {
            await sock.sendMessage(from, { text: `❌ *System Error:* ${e.message}` }, { quoted: msg });
        }
    }
};
