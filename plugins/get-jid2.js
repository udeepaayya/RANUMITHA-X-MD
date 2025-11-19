const { cmd } = require('../command');

cmd({
    pattern: "jid2",
    alias: ["id2", "chatid2", "gjid2"],
    desc: "Convert any number to full WhatsApp JID (All countries supported)",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        let input = m.text.split(" ")[1];
        let num;

        if (!input) {
            // Extract digits from current chat JID
            num = from.replace(/\D/g, "");
        } else {
            // Extract digits from provided input
            num = input.replace(/\D/g, "");
        }

        if (num.length < 5) return reply("⚠️ Invalid number.");

        // Remove leading zeros UNLESS it's a valid country code
        if (num.startsWith("00")) {
            num = num.slice(2); // Convert 00XX to just XX
        }

        // Convert +XXXXXXXXXX → XXXXXXXXXX
        // Already done by replace(/\D/g, "")

        // Final JID
        let jid = `${num}@s.whatsapp.net`;

        return reply(jid);

    } catch (e) {
        reply(`⚠️ ${e.message}`);
    }
});
