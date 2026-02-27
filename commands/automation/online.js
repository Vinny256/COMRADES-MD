module.exports = {
    name: "online",
    category: "automation",
    desc: "V_HUB: Triple-Tier Stealth Control",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        // 🔒 OWNER LOCK
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            return await sock.sendMessage(from, { 
                text: `╭─── ~✾~ *V_HUB SECURITY* ~✾~ ───\n│\n│ ⚠️ *Alert:* Unauthorized Access\n│ 🛡️ *Status:* Founder Only\n│\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` 
            }, { quoted: msg });
        }

        const mode = args[0]?.toLowerCase();

        try {
            if (mode === 'on') {
                // TIER 1: STANDARD ONLINE
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('available');
                
                await sock.sendMessage(from, { react: { text: "🟢", key: msg.key } });
                await sock.sendMessage(from, { text: `╭─── ~✾~ *STATUS: LIVE* ~✾~ ───\n│\n│ ✅ *Visibility:* Everyone\n│ 📡 *Presence:* Online\n│\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` }, { quoted: msg });
            } 
            else if (mode === 'freeze') {
                // TIER 2: OFFICIAL GHOST (FROZEN)
                await sock.updateLastSeenPrivacy('none');
                await sock.updateOnlinePrivacy('match_last_seen');
                await sock.sendPresenceUpdate('unavailable');

                await sock.sendMessage(from, { react: { text: "❄️", key: msg.key } });
                await sock.sendMessage(from, { text: `╭─── ~✾~ *STATUS: FROZEN* ~✾~ ───\n│\n│ 🛡️ *Safety:* 100% (Official)\n│ ❄️ *Presence:* Stagnant\n│ 💡 *Note:* You cannot see others.\n│\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` }, { quoted: msg });
            } 
            else if (mode === 'god' || mode === 'og') {
                // TIER 3: ONE-WAY MIRROR (GB-STYLE)
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('unavailable');

                const warning = `╭─── ~✾~ *GOD MODE ACTIVE* ~✾~ ───\n` +
                                `│\n` +
                                `│ ⚠️ *WARNING:* High Ban Risk.\n` +
                                `│ 👁️ *Vision:* One-Way Mirror\n` +
                                `│ 👻 *Presence:* Hidden\n` +
                                `│\n` +
                                `│ _Usage of this feature is at your_\n` +
                                `│ _own risk. If account is banned,_\n` +
                                `│ _it is up to you._\n` +
                                `│\n` +
                                `│ 🛠️ *To Revert:* ${prefix}online off\n` +
                                `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;

                await sock.sendMessage(from, { react: { text: "💀", key: msg.key } });
                await sock.sendMessage(from, { text: warning }, { quoted: msg });
            }
            else if (mode === 'off') {
                // SAFE REVERT
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('available');
                await sock.sendMessage(from, { text: "🔄 *System:* Reverted to standard online status." }, { quoted: msg });
            }
            else {
                // STYLED MENU
                const menu = `╭─── ~✾~ *STEALTH HUB* ~✾~ ───\n` +
                             `│\n` +
                             `│  ◦ *${prefix}online on*\n` +
                             `│    └─ Standard Online\n` +
                             `│\n` +
                             `│  ◦ *${prefix}online freeze*\n` +
                             `│    └─ Safe Ghost (Frozen)\n` +
                             `│\n` +
                             `│  ◦ *${prefix}online god*\n` +
                             `│    └─ One-Way Mirror (Risky)\n` +
                             `│\n` +
                             `│  ◦ *${prefix}online off*\n` +
                             `│    └─ Reset to Default\n` +
                             `├──────────────────────────\n` +
                             `│  © 2026 | Vinnie Hub\n` +
                             `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;
                await sock.sendMessage(from, { text: menu }, { quoted: msg });
            }
        } catch (e) {
            await sock.sendMessage(from, { text: `❌ *System Error:* ${e.message}` }, { quoted: msg });
        }
    }
};
