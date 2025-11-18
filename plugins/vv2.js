const { cmd } = require("../command");
const fs = require("fs");

cmd({
    pattern: "vv2",
    react: '🐳',
    alias: ["viewonce", "anti-vv"],
    desc: "Unlock view once media",
    category: "media",
    filename: __filename
},
async (client, message, m, { reply }) => {
    try {
        // Check reply
        const quoted = message.quoted;
        if (!quoted) return reply("*⚠️ Reply to a view once message!*");

        // Check if view once
        const msg = quoted.msg || quoted.message;

        if (!msg || !msg.viewOnce) {
            return reply("❌ *This is not a view-once message!*");
        }

        let mediaType;
        if (msg.imageMessage) mediaType = "image";
        else if (msg.videoMessage) mediaType = "video";
        else if (msg.audioMessage) mediaType = "audio";
        else return reply("⚠️ Unsupported view-once format!");

        // Download media
        const buffer = await quoted.download();
        if (!buffer) return reply("❌ Download failed!");

        // Send back as normal file
        await client.sendMessage(message.chat, {
            [mediaType]: buffer,
            caption: "🔓 *View Once Unlocked!*"
        }, { quoted: message });

    } catch (e) {
        console.log(e);
        reply("❌ Error occurred!");
    }
});
