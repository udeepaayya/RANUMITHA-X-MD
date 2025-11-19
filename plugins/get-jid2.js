const { cmd } = require('../command');

cmd({
    pattern: "jid2",
    alias: ["id2", "chatid2", "gjid2"],
    desc: "Get full JID from number, group, channel, or current chat",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { from, isGroup, reply }) => {
    try {
        let input = m.text.split(" ")[1];
        let chatJID;

        if (!input) {
            // No input → return current chat JID correctly
            if (isGroup) {
                chatJID = from; // group
            } 
            else if (from.endsWith("@newsletter")) {
                chatJID = from; // channel
            } 
            else {
                // FORCE inbox JID only
                let num = from.replace(/\D/g, "");
                chatJID = `${num}@s.whatsapp.net`;
            }
        } 
        else {
            // Input provided
            input = input.replace(/\D/g, "");
            if (input.length < 8) return reply("⚠️ Please provide a valid number.");

            // Group JID starts with 1203
            if (input.startsWith("1203")) {
                chatJID = `${input}@g.us`;
            } else {
                chatJID = `${input}@s.whatsapp.net`; // Always inbox for numbers
            }
        }

        return reply(chatJID);

    } catch (e) {
        console.error("JID Error:", e);
        reply(`⚠️ ${e.message}`);
    }
});
