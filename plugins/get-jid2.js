const { cmd } = require('../command');

cmd({
    pattern: "jid2",
    alias: ["id2", "chatid2", "gjid2"],
    desc: "Return correct Sri Lankan inbox JID",
    react: "🆔",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        let input = m.text.split(" ")[1];
        let num;

        if (!input) {
            num = from.replace(/\D/g, "");
        } else {
            num = input.replace(/\D/g, "");
        }

        if (num.length < 5) return reply("⚠️ Invalid number.");

        // 🇱🇰 AUTO FIX SRI LANKA NUMBERS
        // If number starts with 07XXXXXXXX
        if (num.startsWith("0") && num.length === 10) {
            num = "94" + num.slice(1);
        }

        // If number is 9 digits mobile (771853633)
        if (num.length === 9) {
            num = "94" + num;
        }

        // If number is 10 digits starting with 7 (7718536330) — fix too
        if (num.length === 10 && num.startsWith("7")) {
            num = "94" + num;
        }

        // ALWAYS send as inbox JID
        let jid = `${num}@s.whatsapp.net`;

        return reply(jid);

    } catch (e) {
        reply(`⚠️ ${e.message}`);
    }
});
