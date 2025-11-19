const { cmd } = require('../command');

cmd({
    pattern: "jid2",
    alias: ["id2", "chatid2", "gjid2"],
    desc: "Always return inbox JID in the format number@s.whatsapp.net",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        let input = m.text.split(" ")[1];
        let num;

        if (!input) {
            // Extract number from current chat JID
            num = from.replace(/\D/g, "");
        } else {
            // Extract number from provided input
            num = input.replace(/\D/g, "");
        }

        if (num.length < 8) return reply("⚠️ Invalid number.");

        // ALWAYS inbox JID format
        let jid = `${num}@s.whatsapp.net`;

        return reply(jid);

    } catch (e) {
        console.error("JID Error:", e);
        reply(`⚠️ ${e.message}`);
    }
});
