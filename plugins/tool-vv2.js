const { cmd } = require("../command");

cmd({
  pattern: "vv2",
  react: "👁️",
  desc: "Unlock view once media",
  use: ".vv2 (reply view once)",
  filename: __filename
},
async (conn, mek, m, { quoted, reply }) => {
  try {

    if (!quoted) return reply("📌 Reply to a *View Once* message!");

    // extract the real message
    const msg = quoted.message?.viewOnceMessageV2 ||
                quoted.message?.viewOnceMessageV2Extension ||
                quoted.msg?.message?.viewOnceMessageV2 ||
                quoted.msg?.message?.viewOnceMessageV2Extension;

    if (!msg) return reply("❌ Not a view-once media message!");

    // find media message inside
    const inner = msg.message.imageMessage ||
                  msg.message.videoMessage ||
                  msg.message.audioMessage;

    if (!inner) return reply("⚠️ Media not found inside view-once message!");

    // download the media
    const buffer = await conn.downloadMediaMessage({
      message: { ...msg }
    });

    // send unlocked media
    if (msg.message.imageMessage) {
      await conn.sendMessage(mek.chat, { image: buffer, caption: "🔓 Unlocked Photo" }, { quoted: mek });
    } else if (msg.message.videoMessage) {
      await conn.sendMessage(mek.chat, { video: buffer, caption: "🔓 Unlocked Video" }, { quoted: mek });
    } else if (msg.message.audioMessage) {
      await conn.sendMessage(mek.chat, { audio: buffer, mimetype: "audio/mp4", ptt: true }, { quoted: mek });
    } else {
      return reply("❌ Unknown media
