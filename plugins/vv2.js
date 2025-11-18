const { cmd } = require("../command");

cmd({
    pattern: "vv",
    react: '🐳',
    alias: ["viewonce", "anti-vv"],
    desc: "Unlock any view-once media",
    category: "media",
    filename: __filename
},
async (client, message, m, { reply }) => {
    try {
        const quoted = message.quoted;
        if (!quoted) return reply("⚠️ *Reply to a view-once message!*");

        const qmsg = quoted.message || quoted.msg;

        // NEW BAILEYS VIEW-ONCE STRUCTURE FIX
        const vo =
            qmsg?.viewOnceMessageV2 ||
            qmsg?.viewOnceMessage ||
            qmsg?.viewOnceMessageV2Extension;

        if (!vo) {
            return reply("❌ *This is not a view-once message!*");
        }

        // Extract actual media inside wrapper
        const inner = vo.message || vo;

        let mediaType;
        if (inner.imageMessage) mediaType = "image";
        else if (inner.videoMessage) mediaType = "video";
        else if (inner.audioMessage) mediaType = "audio";
        else return reply("⚠️ Unsupported view-once media!");

        // Download
        const buffer = await client.downloadMediaMessage({ message: inner });
        if (!buffer) return reply("❌ Download failed!");

        // Send back
        await client.sendMessage(message.chat, {
            [mediaType]: buffer,
            caption: "🔓 *View Once Unlocked!*"
        }, { quoted: message });

    } catch (e) {
        console.log(e);
        reply("❌ Error occurred!");
    }
});
