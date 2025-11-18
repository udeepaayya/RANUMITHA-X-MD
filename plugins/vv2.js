const { cmd } = require("../command");

cmd({
  pattern: "vv2v",
  alias: ["vv2","viewonce","retrieve"],
  react: '🐳',
  desc: "Unlock any view-once media",
  category: "media",
  filename: __filename
}, async (client, message) => {
  try {

    const q = message.quoted;
    if (!q) {
      return await client.sendMessage(message.chat, {
        text: "⚠️ Reply to a *view-once* message!"
      }, { quoted: message });
    }

    // ---------- REAL FIX STARTS ----------
    // Detect correct view-once wrapper regardless of structure
    const qm = q.message || q.msg || {};

    const vo =
      qm?.viewOnceMessageV2 ||
      qm?.viewOnceMessage ||
      qm?.viewOnceMessageV2Extension ||
      qm?.ephemeralMessage?.message?.viewOnceMessageV2 ||
      qm?.ephemeralMessage?.message?.viewOnceMessage;

    if (!vo) {
      return await client.sendMessage(message.chat, {
        text: "❌ *This is not a view-once message!*"
      }, { quoted: message });
    }

    // Extract real content inside view-once wrapper
    const inner = vo?.message || {};

    let type = null;
    if (inner.imageMessage) type = "image";
    if (inner.videoMessage) type = "video";
    if (inner.audioMessage) type = "audio";

    if (!type) {
      return await client.sendMessage(message.chat, {
        text: "❌ Unsupported view-once file!"
      }, { quoted: message });
    }

    // Download real media
    const buffer = await client.downloadMediaMessage({ message: inner });

    if (!buffer) {
      return await client.sendMessage(message.chat, {
        text: "❌ Download failed!"
      }, { quoted: message });
    }

    // ---------- SEND BACK NORMAL MEDIA ----------
    let sendData = {};

    if (type === "image") {
      sendData = {
        image: buffer,
        caption: "🔓 *View Once Unlocked!*"
      };
    }

    if (type === "video") {
      sendData = {
        video: buffer,
        caption: "🔓 *View Once Unlocked!*"
      };
    }

    if (type === "audio") {
      sendData = {
        audio: buffer,
        mimetype: "audio/mp4",
        ptt: inner.audioMessage?.ptt || false
      };
    }

    await client.sendMessage(message.chat, sendData, { quoted: message });

  } catch (e) {
    console.log("VV Error:", e);
    await client.sendMessage(message.chat, {
      text: "❌ Error:\n" + e.message
    }, { quoted: message });
  }
});
