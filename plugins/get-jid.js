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

        if (isGroup) {
            // GROUP JID
            chatJID = from;

        } else if (from.endsWith('@newsletter')) {
            // CHANNEL JID
            chatJID = from;

        } else if (from.endsWith('@s.whatsapp.net')) {
            // PRIVATE CHAT RECEIVER JID (CORRECT)
            chatJID = from;

        } else {
            chatJID = from || sender;
        }

        return reply(chatJID);

    } catch (e) {
        console.error("JID Error:", e);
        reply(`⚠️ ${e.message}`);
    }
});
