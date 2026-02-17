const axios = require('axios');

// Hardcoded for Vinnie Digital Hub - Ease of Access
const PROXY_URL = "https://vhubg-27494ea43fc4.herokuapp.com/api";
const API_SECRET = "Vinnie_Bot_Wallet"; 

const hubClient = {
    /**
     * Triggers the M-PESA STK Push via V_Hub Proxy
     */
    async deposit(phone, amount, jid) {
        try {
            console.log(`┃ 🚀 V_HUB: Initiating deposit for ${phone}...`);
            const res = await axios.post(`${PROXY_URL}/deposit/prompt`, 
                { 
                    phone: phone, 
                    amount: amount, 
                    jid: jid 
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
            // Ultimate Logging for debugging user errors
            console.error("┃ ❌ V_HUB_ERROR:", e.response?.data || e.message);
            return null;
        }
    }
};

module.exports = hubClient;