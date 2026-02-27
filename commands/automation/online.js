module.exports = {
    name: "online",
    category: "automation",
    async execute(sock, msg, args, { prefix, from, isMe }) {
        
        if (!isMe) {
            await sock.sendMessage(from, { react: { text: "🚫", key: msg.key } });
            return await sock.sendMessage(from, { 
                text: `╭─── ~✾~ *V_HUB SECURITY* ~✾~ ───\n│\n│ ⚠️ *Alert:* Unauthorized Access\n│ 🛡️ *Status:* Founder Only\n│\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` 
            }, { quoted: msg });
        }

        const mode = args[0]?.toLowerCase();
        const hubName = "VINNIE STEALTH HUB";

        try {
            if (mode === 'on') {
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('available');
                await sock.sendMessage(from, { text: "🟢 *Status:* System fully visible." }, { quoted: msg });
            } 

            else if (mode === 'freeze') {
                await sock.updateLastSeenPrivacy('none');
                await sock.updateOnlinePrivacy('match_last_seen');
                await sock.sendPresenceUpdate('unavailable');
                await sock.sendMessage(from, { text: "❄️ *Status:* Official Freeze (Safe)." }, { quoted: msg });
            }

            else if (mode === 'god' || mode === 'og') {
                // Warning Logic for Standard God
                if (args[1] !== 'accept') {
                    return await sock.sendMessage(from, { 
                        text: `╭─── ~✾~ *HIGH ALERT* ~✾~ ───\n│\n│ ⚠️ *Warning:* Standard God Mode\n│ 👁️ *Vision:* One-Way\n│ 🛡️ *Risk:* Potential Ban\n│\n│ _To activate, type:_\n│ *${prefix}online ${mode} accept*\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` 
                    }, { quoted: msg });
                }
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await new Promise(r => setTimeout(r, 1000));
                await sock.sendPresenceUpdate('unavailable');
                await sock.sendMessage(from, { text: "💀 *OG Mode:* Vision active. Presence hidden." }, { quoted: msg });
            }

            else if (mode === 'godpro') {
                // ❄️ THE TIME PARADOX (GOD PRO)
                if (args[1] !== 'accept') {
                    return await sock.sendMessage(from, { 
                        text: `╭─── ~✾~ *EXTREME ALERT* ~✾~ ───\n│\n│ ⚠️ *Warning:* God Pro Mode\n│ ❄️ *Feature:* Stagnant Last Seen\n│ 👁️ *Vision:* You see them, they see\n│     a fake/old timestamp.\n│ 🛡️ *Risk:* Highest Ban Probablity\n│\n│ _To activate, type:_\n│ *${prefix}online godpro accept*\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` 
                    }, { quoted: msg });
                }
                
                // Set privacy to ALL so you can see them
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                
                // KILL THE SIGNAL: We immediately send unavailable to stagnant the time
                await sock.sendPresenceUpdate('unavailable');
                
                await sock.sendMessage(from, { react: { text: "🌀", key: msg.key } });
                await sock.sendMessage(from, { 
                    text: `╭─── ~✾~ *GOD PRO: ACTIVE* ~✾~ ───\n│\n│ 🌀 *Status:* Time Paradox Engaged\n│ 👁️ *You See:* Everything\n│ ❄️ *They See:* Frozen Timestamp\n│\n│ _If you get banned, it is on you._\n│ _Revert: ${prefix}online off_\n╰─── ~✾~ *Vinnie Hub* ~✾~ ───` 
                }, { quoted: msg });
            }

            else if (mode === 'off') {
                await sock.updateLastSeenPrivacy('all');
                await sock.updateOnlinePrivacy('all');
                await sock.sendPresenceUpdate('available');
                await sock.sendMessage(from, { text: "🔄 *System:* Stealth features disabled." }, { quoted: msg });
            }

            else {
                // Main Menu
                const menu = `╭─── ~✾~ *${hubName}* ~✾~ ───\n` +
                             `│\n` +
                             `│  ◦ *${prefix}online on* (Default)\n` +
                             `│  ◦ *${prefix}online freeze* (Safe Ghost)\n` +
                             `│  ◦ *${prefix}online god* (One-Way)\n` +
                             `│  ◦ *${prefix}online godpro* (Paradox)\n` +
                             `│  ◦ *${prefix}online off* (Reset)\n` +
                             `│\n` +
                             `╰─── ~✾~ *Infinite Impact* ~✾~ ───`;
                await sock.sendMessage(from, { text: menu }, { quoted: msg });
            }

        } catch (e) {
            await sock.sendMessage(from, { text: `❌ *Error:* ${e.message}` }, { quoted: msg });
        }
    }
};
