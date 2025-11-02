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
        let chatType;

        if (from.endsWith('@g.us')) {
            // Group
            chatJID = from;
            chatType = "🧩 Group";
        } else if (from.endsWith('@newsletter')) {
            // Channel
            chatJID = from;
            chatType = "📢 Channel";
        } else if (sender.endsWith('@s.whatsapp.net')) {
            // Private Chat
            chatJID = sender;
            chatType = "💬 Private Chat";
        } else {
            // Unknown or special case
            chatJID = from || sender;
            chatType = "❓ Unknown Type";
        }

        return reply(`${chatType} JID: \n${chatJID}`);

    } catch (e) {
        console.error("JID Error:", e);
        reply(`⚠️ Error fetching JID:\n${e.message}`);
    }
});
