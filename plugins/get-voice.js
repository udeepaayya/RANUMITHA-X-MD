const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "getvoice",
    alias: ["gv"],
    desc: "Send direct link as WhatsApp voice",
    category: "owner",
    react: "🎤",
    filename: __filename
},
async (robin, mek, m, { from, isOwner, args }) => {

    try {
        if (!isOwner) return mek.reply("❌ Owner only!");

        const url = args[0];
        if (!url) return mek.reply("⚠️ Send audio direct URL.\nExample:\n.getvoice https://example.com/audio.ogg");

        mek.reply("⬇️ Fetching voice...");

        const response = await axios.get(url, { responseType: "arraybuffer" });

        await robin.sendPresenceUpdate("recording", from);

        await robin.sendMessage(from, {
            audio: Buffer.from(response.data),
            mimetype: "audio/ogg; codecs=opus",
            ptt: true
        }, { quoted: mek });

        mek.reply("✔️ Voice sent!");

    } catch (err) {
        console.log(err);
        mek.reply("❌ Audio URL invalid or unsupported format.");
    }
});
