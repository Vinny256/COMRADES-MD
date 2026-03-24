import fs from 'fs-extra';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const settingsFile = './settings.json';

// --- 🛠️ DYNAMIC SETTINGS LOADER ---
let settings = {};
try { 
    if (fs.existsSync(settingsFile)) {
        settings = fs.readJsonSync(settingsFile); 
    } else {
        // Create default settings if file is missing
        settings = { mode: 'public', bluetick: false, typingMode: 'off' };
        fs.writeJsonSync(settingsFile, settings);
    }
} catch(e) { 
    console.error("⚠️ [CONFIG_WARN]: Settings file corrupted, using defaults.");
    settings = { mode: 'public', bluetick: false, typingMode: 'off' }; 
}

/**
 * V-HUB_CORE: GLOBAL_CONFIGURATION
 * Filename: config.js
 * Logic: Merges Local JSON Settings with Heroku Environment Variables.
 */
const config = {
    ...settings,
    
    // --- 🚀 SERVER ENVIRONMENT ---
    prefix: process.env.PREFIX || ".",
    ownerNumber: (process.env.OWNER_NUMBER || "254768666068").replace(/[^0-9]/g, ""),
    mongoUri: process.env.MONGO_URI,
    sessionId: process.env.SESSION_ID,
    
    // --- 🎨 BRANDING ---
    botName: "V_HUB ELITE",
    ownerName: "Vinnie",
    
    // --- 🛡️ VERSION CONTROL ---
    version: "2.5.0 (ESM-STABLE)",
    nodeVersion: process.version
};

export default config;
