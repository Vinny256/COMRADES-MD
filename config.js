const fs = require('fs-extra');
const settingsFile = './settings.json';

let settings = {};
try { 
    settings = fs.readJsonSync(settingsFile); 
} catch(e) { 
    settings = { mode: 'public', bluetick: false, typingMode: 'off' }; 
}

module.exports = {
    ...settings,
    prefix: process.env.PREFIX || ".",
    ownerNumber: (process.env.OWNER_NUMBER || "254768666068").split('@')[0],
    mongoUri: process.env.MONGO_URI,
    sessionId: process.env.SESSION_ID
};
