const config = {
    // Connection Settings
    sessionId: process.env.SESSION_ID || '',
    mongoUri: process.env.MONGO_URI || '',
    owner: process.env.OWNER_NUMBER || '254...',
    
    // Bot Features (Toggles)
    autoReact: process.env.AUTO_REACT === 'true',
    autoEmoji: process.env.AUTO_REACT_EMOJI || '🔥',
    antiDelete: process.env.ANTI_DELETE === 'true',
    recordMode: process.env.RECORD_MODE || 'all',
    prefix: process.env.PREFIX || '.',
    
    // Heroku Management
    appName: process.env.HEROKU_APP_NAME || '',
    apiKey: process.env.HEROKU_API_KEY || ''
};

module.exports = config;
