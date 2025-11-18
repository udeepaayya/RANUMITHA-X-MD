const { cmd } = require('../command');
const config = require('../config');
const axios = require('axios');

cmd({
    pattern: "getvoice",
    alias: ["gv"],
    desc: "Send voice message from direct audio URL",
    category: "owner",
    react: "🎤",
    filename: __filename
},
async (robin, mek, m, { from, isOwner, args }) => {
    try {

        if (!isOwner) return mek.reply("❌ Owner only command!");

        const url = args[0];
        if (!url) return mek.reply("⚠️ Please give an audio URL!\n\nExample:\n.getvoice https://example.com/audio.mp3");

        mek.reply("⬇️ Processing...");

        // Download audio directly to buffer (no file path)
        const { data } = await axios.get(url, {
            responseType: "arraybuffer"
        });

        await robin.sendPresenceUpdate("recording", from);

        // Send voice note directly
        await robin.sendMessage(from, {
            audio: Buffer.from(data),
            mimetype: "audio/mpeg",
            ptt: true
        }, { quoted: mek });

        mek.reply("✔️ Voice sent!");

    } catch (err) {
        console.error(err);
        mek.reply("❌ Error! Invalid audio URL or download failed.");
    }
});
