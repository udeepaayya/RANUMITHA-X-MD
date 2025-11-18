const { cmd } = require("../command");

cmd({
  pattern: "vv2",
  alias: ["vv", "viewonce", "retrieve"],
  react: '🐳',
  desc: "Retrieve any view-once image/video/audio",
  category: "media",
  filename: __filename
}, async (client, message, match) => {
  try {
    const quoted = message.quoted;

    if (!quoted) {
      return await client.sendMessage(message.chat, {
        text: "*🍁 Please reply to a view-once message!*"
      }, { quoted: message });
    }

    // -----------------------------------------
    // 🔥 NEW BAILEYS VIEW-ONCE FORMAT FIX
    // -----------------------------------------
    const qmsg = quoted.message || quoted.msg;

    const vo =
      qmsg?.viewOnceMessageV2 ||
      qmsg?.viewOnceMessage ||
      qmsg?.viewOnceMessageV2Extension;

    if (!vo) {
      return await client.sendMessage(message.chat, {
        text: "❌ *This is not a view-once message!*"
      }, { quoted: message });
    }

    // Extract actual inner media
    const inner = vo.message || vo;

    let mediaType;
    if (inner.imageMessage) mediaType = "image";
    else if (inner.videoMessage) mediaType = "video";
    else if (inner.audioMessage) mediaType = "audio";
    else {
      return await client.sendMessage(message.chat, {
        text: "❌ Unsupported view-once media type!"
      }, { quoted: message });
    }

    // 🟢 Download media safely
    const buffer = await client.downloadMediaMessage({ message: inner });
    if (!buffer) {
      return await client.sendMessage(message.chat, {
        text: "❌ Download failed!"
      }, { quoted: message });
    }

    // -----------------------------------------
    // 🟢 Send File Back Normally
    // -----------------------------------------
    let content = {};
    if (mediaType === "image") {
      content = {
        image: buffer,
        caption: "🔓 *View Once Unlocked!*"
      };
    } else if (mediaType === "video") {
      content = {
        video: buffer,
        caption: "🔓 *View Once Unlocked!*"
      };
    } else if (mediaType === "audio") {
      content = {
        audio: buffer,
        mimetype: "audio/mp4",
        ptt: inner.audioMessage?.ptt || false
      };
    }

    await client.sendMessage(message.chat, content, { quoted: message });

  } catch (error) {
    console.error("vv2 Error:", error);
    await client.sendMessage(message.chat, {
      text: "❌ Error:\n" + error.message
    }, { quoted: message });
  }
});
