import fs from 'fs-extra';
import { delay } from "@whiskeysockets/baileys";

const settingsFile = './settings.json';

// --- 🎨 V_HUB ELITE STYLING ---
const vStyle = (text) => `┌────────────────────────┈\n│      *ᴠ-ʜᴜʙ_ᴀɴᴛɪᴅᴇʟᴇᴛᴇ* \n└────────────────────────┈\n\n│  ${text}\n└────────────────────────┈`;

// Global Storage for deleted messages (RAM-based)
if (!global.msgStorage) global.msgStorage = {};

/**
 * V-HUB_WORKER: ANTIDELETE_RESTORE
 * Detects and restores revoked messages in Groups & Inbox.
 */
const antiDeleteWorker = {
    name: "antidelete_worker",
    async execute(sock, msg) {
        try {
            const from = msg.key.remoteJid;
            const msgId = msg.key.id;
            const isGroup = from.endsWith('@g.us');

            // 1. Ignore Status & Self-Clutter
            if (!from || from === 'status@broadcast') return;

            // 2. ROBUST STORAGE HANDSHAKE
            // We store every message for 2 hours so we can catch the "Delete for Everyone"
            if (msg.message && !msg.message.protocolMessage) {
                global.msgStorage[msgId] = JSON.parse(JSON.stringify(msg));
                setTimeout(() => { 
                    if (global.msgStorage[msgId]) delete global.msgStorage[msgId]; 
                }, 7200000); // 2 Hours TTL
            }

            // 3. SETTINGS VALIDATION
            if (!fs.existsSync(settingsFile)) return;
            const currentSettings = fs.readJsonSync(settingsFile);
            const config = currentSettings.antidelete || { mode: 'off', dest: 'chat' };

            // Logic: Exit if Mode doesn't match the current environment
            if (config.mode === 'off') return;
            if (config.mode === 'groups' && !isGroup) return;
            if (config.mode === 'inbox' && isGroup) return;

            // 4. DETECTION OF REVOKE (Protocol Type 0)
            const isRevoke = msg.message?.protocolMessage && msg.message.protocolMessage.type === 0;
            
            if (isRevoke) {
                const deletedId = msg.message.protocolMessage.key.id;
                const originalMsg = global.msgStorage[deletedId];

                if (originalMsg) {
                    const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                    
                    // Route destination logic
                    const targetChat = config.dest === 'inbox' ? sock.user.id : from;
                    
                    // Silent logic: Stay quiet if it's a DM or routed to your Inbox
                    const isSilent = !isGroup || config.dest === 'inbox';

                    if (isSilent) {
                        await sock.sendMessage(targetChat, { 
                            text: `┌─『 *ʀᴇsᴛᴏʀᴇᴅ* 』\n│ 👤 *ғʀᴏᴍ:* @${sender.split('@')[0]}\n└────────────────────────┈`,
                            mentions: [sender]
                        });
                    } else {
                        await sock.sendMessage(targetChat, { 
                            text: vStyle(`🚫 *sʏsᴛᴇᴍ_ᴀʟᴇʀᴛ*\n│ ᴜsᴇʀ: @${sender.split('@')[0]}\n│ ᴀᴄᴛɪᴏɴ: ᴅᴇʟᴇᴛᴇ_ᴀᴛᴛᴇᴍᴘᴛ\n│ sᴛᴀᴛᴜs: *ʀᴇsᴛᴏʀᴇᴅ*`),
                            mentions: [sender]
                        });
                    }

                    await delay(500);

                    // --- 🚀 THE RESTORATION ---
                    const mtype = Object.keys(originalMsg.message)[0];
                    
                    if (mtype === 'conversation' || mtype === 'extendedTextMessage') {
                        const textContent = originalMsg.message.conversation || originalMsg.message.extendedTextMessage.text;
                        await sock.sendMessage(targetChat, { text: `│ 💬 *ᴄᴏɴᴛᴇɴᴛ:* ${textContent}\n└────────────────────────┈` });
                    } else {
                        // For Media: Forwarding ensures the content loads properly from server cache
                        await sock.sendMessage(targetChat, { forward: originalMsg }, { quoted: originalMsg });
                    }
                    
                    // Clear RAM after restoration
                    delete global.msgStorage[deletedId];
                }
            }
        } catch (err) {
            console.error("🛰️ [ANTIDELETE_ERR]:", err.message);
        }
    }
};

export default antiDeleteWorker;
