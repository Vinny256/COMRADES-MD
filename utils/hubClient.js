const axios = require('axios');

// Hardcoded for Vinnie Digital Hub - Ease of Access
const PROXY_URL = "https://vhubg-27494ea43fc4.herokuapp.com/api";
const API_SECRET = "Vinnie_Bot_Wallet"; 

const hubClient = {
    /**
     * Triggers the M-PESA STK Push via V_Hub Proxy
     * @param {string} phone - The M-PESA number to charge
     * @param {number} amount - Amount in KSH
     * @param {string} jid - WhatsApp Chat ID
     * @param {string} waName - The WhatsApp Name
     * @param {string} vHubId - The Wallet ID (Optional)
     */
    async deposit(phone, amount, jid, waName, vHubId = "GUEST") {
        try {
            // --- 🚀 THE DYNAMIC FIX ---
            // This grabs the bot's own URL from Heroku settings
            // If APP_URL isn't set, it tries to build it using the App Name
            const myUrl = process.env.APP_URL || `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`;

            console.log(`┃ 🚀 V_HUB: Initiating deposit for ${waName} (${phone})...`);
            
            const res = await axios.post(`${PROXY_URL}/deposit/prompt`, 
                { 
                    phone: phone, 
                    amount: amount, 
                    jid: jid,
                    waName: waName,
                    ref: vHubId, // Sending the Wallet ID/Ref
                    callbackUrl: myUrl // <--- CRITICAL: Telling the Proxy where this bot lives
                },
                { 
                    headers: { 
                        'x-vhub-secret': API_SECRET,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            return res.data;
            
        } catch (e) {
            console.error("┃ ❌ V_HUB_HTTP_ERROR:", e.response?.data || e.message);
            return null;
        }
    },

    /**
     * Triggers M-PESA B2C Disbursement via V_Hub Proxy
     */
    async withdraw(phone, amount, waName) {
        try {
            console.log(`┃ 💸 V_HUB: Disbursing KSH ${amount} to ${phone}...`);
            
            const res = await axios.post(`${PROXY_URL}/withdraw`, 
                { 
                    phone: phone, 
                    amount: amount,
                    waName: waName
                },
                { 
                    headers: { 
                        'x-vhub-secret': API_SECRET,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            return {
                success: true,
                receipt: res.data.receipt || "B2C_OK",
                newBalance: res.data.newBalance
            };
            
        } catch (e) {
            console.error("┃ ❌ V_HUB_WITHDRAW_ERROR:", e.response?.data || e.message);
            return { 
                success: false, 
                message: e.response?.data?.error || e.message 
            };
        }
    },

    /**
     * Checks the transaction status/history for a user
     */
    async checkStatus(phone) {
        try {
            const res = await axios.get(`${PROXY_URL}/check-status?phone=${phone}`, {
                headers: { 
                    'x-vhub-secret': API_SECRET 
                }
            });
            return res.data;
        } catch (e) {
            console.error("┃ ❌ V_HUB_STATUS_ERROR:", e.message);
            return { status: "ERROR", message: e.message };
        }
    }
};

module.exports = hubClient;
