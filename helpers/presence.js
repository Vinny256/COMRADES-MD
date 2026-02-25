module.exports = async (sock, from, settings, isGroup, isInbox) => {
    const mode = settings.typingMode || 'off';
    let shouldType = (mode === 'all' || (mode === 'groups' && isGroup) || (mode === 'inbox' && isInbox));
    
    if (shouldType) {
        const action = settings.alwaysRecording ? 'recording' : 'composing';
        await sock.sendPresenceUpdate(action, from);
        await new Promise(r => setTimeout(r, 10000));
        await sock.sendPresenceUpdate('paused', from);
    }
};
