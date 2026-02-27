module.exports = {
    name: "online",
    category: "automation",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        // 🔒 OWNER LOCK & STYLED FALLBACK
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            return await sock.sendMessage(from, { 
                text: `╭─── ~✾~ *V_HUB SECURITY* ~✾~ ───\n│\n│ ⚠️ *Alert:* Unauthorized Access\n│ 🛡️ *Status:* Founder Only\n│\n╰─── ~✾~ *Infinite Impact* ~✾~ ───` 
            }, { quoted: msg });
        }

        const mode = args[0]?.toLowerCase();

        try {
            if (mode === 'on') {
                // TIER 1: FULL VISIBILITY
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('available');
                
                await sock.sendMessage(from, { react: { text: "🟢", key: msg.key } });
                await sock.sendMessage(from, { 
                    text: `╭─── ~✾~ *SYSTEM UPDATE* ~✾~ ───\n│\n│ ✅ *Status:* Online & Visible\n│ 📡 *Mode:* Standard\n│\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` 
                }, { quoted: msg });
            } 

            else if (mode === 'freeze') {
                // TIER 2: OFFICIAL GHOST (FROZEN/HIDDEN)
                // This hides last seen COMPLETELY and stays stagnant.
                await sock.updateLastSeenPrivacy('none');
                await sock.updateOnlinePrivacy('match_last_seen');
                await sock.sendPresenceUpdate('unavailable');

                await sock.sendMessage(from, { react: { text: "❄️", key: msg.key } });
                await sock.sendMessage(from, { 
                    text: `╭─── ~✾~ *SYSTEM UPDATE* ~✾~ ───\n│\n│ ❄️ *Status:* Last Seen Frozen\n│ 🛡️ *Safety:* 100% Secure\n│ 💡 *Note:* You cannot see others.\n│\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` 
                }, { quoted: msg });
            }

            else if (mode === 'godpro') {
                // TIER 3: GOD PRO (ONE-WAY TRAFFIC)
                if (args[1] !== 'accept') {
                    return await sock.sendMessage(from, { 
                        text: `╭─── ~✾~ *EXTREME ALERT* ~✾~ ───\n│\n│ ⚠️ *Warning:* God Pro Mode\n│ 👁️ *Vision:* You see them\n│ ❄️ *Timestamp:* Stagnant/Old\n│ 🛡️ *Signals:* Typing & Reading OFF\n│\n│ _To activate, type:_\n│ *${prefix}online godpro accept*\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` 
                    }, { quoted: msg });
                }
                
                // 1. Open Eyes (Reciprocity)
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                
                // 2. Kill signals (Stealth)
                // We don't call read or compose presence here
                await sock.sendPresenceUpdate('unavailable');
                
                // Note: You must ensure your index.js 'auto-read' is off
                await sock.sendMessage(from, { react: { text: "🌀", key: msg.key } });
                await sock.sendMessage(from, { 
                    text: `╭─── ~✾~ *GOD PRO: ACTIVE* ~✾~ ───\n│\n│ 👁️ *Status:* One-Way Mirror On\n│ 🔇 *Stealth:* Typing/Reading Blocked\n│ ❄️ *Time:* Frozen at this moment\n│\n╰─── ~✾~ *Infinite Impact* ~✾~ ───` 
                }, { quoted: msg });
            }

            else if (mode === 'off') {
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('available');
                await sock.sendMessage(from, { text: "🔄 *System:* Stealth disabled." }, { quoted: msg });
            }

            else {
                // RESTORED STYLED MENU
                const menu = `╭─── ~✾~ *STEALTH HUB* ~✾~ ───\n` +
                             `│\n` +
                             `│  ◦ *${prefix}online on*\n` +
                             `│    └─ Standard Visibility\n` +
                             `│\n` +
                             `│  ◦ *${prefix}online freeze*\n` +
                             `│    └─ Safe Frozen Ghost\n` +
                             `│\n` +
                             `│  ◦ *${prefix}online godpro*\n` +
                             `│    └─ Mirror (Risky/Experimental)\n` +
                             `│\n` +
                             `│  ◦ *${prefix}online off*\n` +
                             `│    └─ Reset to Default\n` +
                             `├──────────────────────────\n` +
                             `│  © 2026 | Vinnie Hub\n` +
                             `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;
                await sock.sendMessage(from, { text: menu }, { quoted: msg });
            }

        } catch (e) {
            await sock.sendMessage(from, { text: `❌ *Error:* ${e.message}` }, { quoted: msg });
        }
    }
};
