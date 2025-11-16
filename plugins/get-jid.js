const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "jid",
    alias: ["id", "chatid", "gjid"],  
    desc: "Get full JID of current chat/user/channel or build inbox JID",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, reply, sender, args
}) => {
    try {

        // If user sends a number → build inbox JID
        if (args[0]) {
            let num = args[0].replace(/[^0-9]/g, ""); // remove spaces, +, etc.

            if (num.length < 7)
                return reply("❌ Valid mobile number ekak denna.");

            return reply(`${num}@s.whatsapp.net`);
        }

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
