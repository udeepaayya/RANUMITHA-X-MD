const { cmd } = require("../command");
let maybeDownloadContentFromMessage;
try {
    maybeDownloadContentFromMessage = require("@adiwajshing/baileys").downloadContentFromMessage;
} catch {}

cmd({
    pattern: "vv",
    alias: ["viewonce", "rview"],
    react: "🫟",
    desc: "ViewOnce Bypass (Owner + Bot Only)",
    category: "owner",
    filename: __filename
}, async (client, message, match, { from, isOwner }) => {

    try {
        const botNumber = client.user.id.split(":")[0] + "@s.whatsapp.net";
        const sender = message.sender || message.key.participant || message.participant;
        const isBot = sender === botNumber;

        if (!isOwner && !isBot)
            return await message.reply("🚫 *Owner Only Command!*");

        if (!message.quoted)
            return await message.reply("🍁 *Please reply to a view-once message!*");

        let quoted = message.quoted;

        // -------------------------------
        // ✅ FIX: Extract REAL Media Layer
        // -------------------------------
        let realMsg = quoted.message;

        if (!realMsg) return await message.reply("❌ *Invalid message!*");

        if (realMsg.viewOnceMessage)
            realMsg = realMsg.viewOnceMessage.message;

        if (realMsg.viewOnceMessageV2)
            realMsg = realMsg.viewOnceMessageV2.message;

        if (realMsg.viewOnceMessageV2Extension)
            realMsg = realMsg.viewOnceMessageV2Extension.message;

        const mediaType = Object.keys(realMsg)[0]; // imageMessage / videoMessage / audioMessage

        if (!mediaType || !realMsg[mediaType].mediaKey)
            return await message.reply("❌ *This message has no media key (not a valid view-once media).*");

        let buffer;

        // -------------------------------
        // 📥 Download media safely
        // -------------------------------
        const stream = await maybeDownloadContentFromMessage(realMsg[mediaType], mediaType.replace("Message",""));
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        buffer = Buffer.concat(chunks);

        // -------------------------------
        // 📤 Send media back
        // -------------------------------
        let payload = {};

        if (mediaType === "imageMessage") {
            payload = { image: buffer, caption: realMsg[mediaType].caption || "" };
        } else if (mediaType === "videoMessage") {
            payload = { video: buffer, caption: realMsg[mediaType].caption || "" };
        } else if (mediaType === "audioMessage") {
            payload = { audio: buffer, mimetype: "audio/mp4", ptt: false };
        } else {
            return await message.reply("❌ *Unsupported media type!*");
        }

        await client.sendMessage(from, payload, { quoted: message });

    } catch (e) {
        console.log("VV ERROR:", e);
        await message.reply("❌ *VV Error:* " + e.message);
    }
});
