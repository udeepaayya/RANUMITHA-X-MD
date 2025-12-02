const { cmd } = require("../command");
const fs = require("fs");

cmd({
  pattern: "vv2",
  alias: ["viewonce2", "unlock2"],
  desc: "Unlock view-once video/photo/voice",
  category: "tool",
  react: "👁️",
  use: ".vv2 (reply to a view once message)",
  filename: __filename,
}, async (conn, mek, m, { quoted, reply }) => {
  try {

    if (!quoted) return reply("🔁 *Reply to a view-once message!*");

    let type = quoted.msg?.type || quoted.mtype;

    // --- PHOTO ---
    if (type === "viewOnceMessageV2" || type === "viewOnceMessageV2Extension") {
      
      const msg = quoted.msg || quoted.message;

      let mediaType = Object.keys(msg.message)[0]; // imageMessage / videoMessage

      let buffer = await conn.downloadMediaMessage({
        message: msg.message
      });

      if (mediaType === "imageMessage") {
        await conn.sendMessage(mek.chat, { image: buffer, caption: "🔓 *Unlocked Photo*" }, { quoted: mek });
      }

      if (mediaType === "videoMessage") {
        await conn.sendMessage(mek.chat, { video: buffer, caption: "🔓 *Unlocked Video*" }, { quoted: mek });
      }

      return;
    }

    // --- VOICE / AUDIO (if protected) ---
    if (quoted.mtype === "audioMessage") {
      let buffer = await quoted.download();

      await conn.sendMessage(
        mek.chat,
        { audio: buffer, mimetype: "audio/mp4", ptt: true },
        { quoted: mek }
      );
      return;
    }

    return reply("❌ *This is not a view-once media message!*");

  } catch (e) {
    console.log(e);
    reply("⚠️ Error unlocking view-once media.");
  }
});
