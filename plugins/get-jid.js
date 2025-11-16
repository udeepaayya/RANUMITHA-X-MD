const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "jid",
    alias: ["id", "chatid", "gjid"],  
    desc: "Get phone number of sender / replied user in inbox, group or channel",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, isGroup, reply, sender, quoted
}) => {
    try {

        let target;

        // ===============================
        // 1. If REPLY → get replied user
        // ===============================
        if (quoted) {
            target = quoted.sender;

        // ===============================
        // 2. If CHANNEL → get channel JID number part
        // ===============================
        } else if (from.endsWith("@newsletter")) {
            target = from;

        // ===============================
        // 3. Otherwise → get sender
        // ===============================
        } else {
            target = sender;
        }

        // Remove JID suffixes
        let number = target
            .replace(/@s\.whatsapp\.net/g, "")
            .replace(/@g\.us/g, "")
            .replace(/@newsletter/g, "")
            .replace(/[^0-9]/g, ""); // keep numbers only

        // If empty number (very rare case)
        if (!number) return reply("❌ Phone number eka hoyaganna bari una.");

        return reply(number);

    } catch (e) {
        console.error("JID Error:", e);
        reply(`⚠️ ${e.message}`);
    }
});
