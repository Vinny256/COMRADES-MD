import axios from 'axios';

// This object will hold chat history in RAM
const chatMemory = {}; 

const geminiCommand = {
    name: 'gemini',
    category: 'ai',
    async execute(sock, m, args) {
        const from = m.key.remoteJid;
        const text = args.join(" ");
        const apiKey = process.env.GROQ_API_KEY;

        if (!text) return sock.sendMessage(from, { 
            text: `┌─『 ɢᴇᴍɪɴɪ_ᴀɪ 』\n│ ⚙ *ʜᴇʏ:* ${m.pushName}\n│ ⚙ ᴡʜᴀᴛ's ᴏɴ ʏᴏᴜʀ ᴍɪɴᴅ? ✧\n└────────────────────────┈` 
        });

        // Phase 1: Thinking State with Sleek Styling
        const { key: msgKey } = await sock.sendMessage(from, { 
            text: `┌────────────────────────┈\n` +
                  `│      *ɢᴇᴍɪɴɪ_ᴇɴɢɪɴᴇ* \n` +
                  `└────────────────────────┈\n\n` +
                  `┌─『 sᴛᴀᴛᴜs 』\n` +
                  `│ ⚙ [ ᴛʜɪɴᴋɪɴɢ... ✦ ]\n` +
                  `└────────────────────────┈` 
        }, { quoted: m });

        try {
            // --- 🧠 MEMORY LOGIC ---
            if (!chatMemory[from]) {
                chatMemory[from] = [
                    { 
                        role: "system", 
                        content: "You are Gemini, a highly intelligent and elegant AI developed by Google, integrated into Vinnie Digital Hub. You are helpful, concise, and professional. You must identify only as Gemini." 
                    }
                ];
            }

            // Add user message
            chatMemory[from].push({ role: "user", content: text });

            // Maintain memory limit (Last 10 exchanges)
            if (chatMemory[from].length > 11) {
                chatMemory[from].splice(1, 2); 
            }

            const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: "llama-3.3-70b-versatile",
                messages: chatMemory[from],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            });

            const reply = response.data.choices[0].message.content;

            // Add AI response to memory
            chatMemory[from].push({ role: "assistant", content: reply });

            // --- ⚡ UNICODE SLEEK STYLING ---
            const styledMsg = `┌────────────────────────┈\n` +
                              `│      *ɢᴇᴍɪɴɪ_ᴀɪ* \n` +
                              `└────────────────────────┈\n\n` +
                              `${reply}\n\n` +
                              `┌────────────────────────┈\n` +
                              `│   *ᴠɪɴɴɪᴇ ᴅɪɢɪᴛᴀʟ ʜᴜʙ*\n` +
                              `└────────────────────────┈`;

            await sock.sendMessage(from, { text: styledMsg, edit: msgKey });

        } catch (e) {
            const errorMsg = e.response?.data?.error?.message || e.message;
            await sock.sendMessage(from, { 
                text: `┌─『 sʏsᴛᴇᴍ_ᴇʀʀ 』\n│ ⚙ *ʀᴇᴀsᴏɴ:* ${errorMsg}\n└────────────────────────┈`, 
                edit: msgKey 
            });
        }
    }
};

export default geminiCommand;
