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
     * @param {string} waName - The WhatsApp Name (e.g., Pius Mpenda Amani)
     */
    async deposit(phone, amount, jid, waName) {
        try {
            console.log(`┃ 🚀 V_HUB: Initiating deposit for ${waName} (${phone})...`);
            
            const res = await axios.post(`${PROXY_URL}/deposit/prompt`, 
                { 
                    phone: phone, 
                    amount: amount, 
                    jid: jid,
                    waName: waName // <--- Crucial: Sending the name to the proxy
                },
                { 
                    headers: { 
                        'x-vhub-secret': API_SECRET,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            // We return the full data. The bot will check if (res.data.ResponseCode === "0")
            return res.data;
            
        } catch (e) {
            // Logging for the Director to see in Heroku logs
            console.error("┃ ❌ V_HUB_HTTP_ERROR:", e.response?.data || e.message);
            return null;
        }
    }
};

module.exports = hubClient;