const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "jid",
    alias: ["id", "chatid", "gjid"],  
    desc: "Get full JID of current chat/user/channel (Creator Only)",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, reply, sender 
}) => {
    try {
        let chatJID;

        if (from.endsWith('@g.us')) {
            // Group
            chatJID = from;
        } else if (from.endsWith('@newsletter')) {
            // Channel
            chatJID = from;
        } else if (sender.endsWith('@s.whatsapp.net')) {
            // Private Chat
            chatJID = sender;
        } else {
            // Unknown or special case
            chatJID = from || sender;
        }

        return reply(chatJID);

    } catch (e) {
        console.error("JID Error:", e);
        reply(`⚠️ ${e.message}`);
    }
});
