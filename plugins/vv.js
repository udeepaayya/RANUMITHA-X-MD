const { cmd } = require("../command");
// if you use baileys v4/v5 directly you may have this helper available:
let maybeDownloadContentFromMessage;
try {
  maybeDownloadContentFromMessage = require('@adiwajshing/baileys').downloadContentFromMessage;
} catch (e) {
  // not available — that's OK, we will fallback to other methods
}

cmd({
  pattern: "vv",
  alias: ["viewonce", "rview"],
  react: "🫟",
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isOwner }) => {
  try {
    if (!isOwner) {
      return await client.sendMessage(from, {
        text: "*🚫 Owner Only Command!*"
      }, { quoted: message });
    }

    if (!message.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a view-once message!*"
      }, { quoted: message });
    }

    const quoted = message.quoted;
    let buffer;

    // 1) If library attached a .download() helper (some wrappers do)
    if (typeof quoted.download === "function") {
      buffer = await quoted.download();

    // 2) If the client has a download helper (some versions expose this)
    } else if (typeof client.downloadMediaMessage === "function") {
      // note: some flavors expect full message object, some expect quoted.message
      try {
        // try using quoted directly
        buffer = await client.downloadMediaMessage(quoted, "buffer", {});
      } catch (err) {
        // fallback to quoted.message
        buffer = await client.downloadMediaMessage(quoted.message || quoted, "buffer", {});
      }

    // 3) Use baileys' downloadContentFromMessage (works for v4/v5)
    } else if (maybeDownloadContentFromMessage && quoted.message) {
      const messageType = Object.keys(quoted.message)[0]; // e.g. 'imageMessage'
      const stream = await maybeDownloadContentFromMessage(quoted.message[messageType], messageType.replace(/Message$/, '').toLowerCase());
      // collect stream to buffer
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      buffer = Buffer.concat(chunks);

    } else {
      throw new Error("No known download method available on this environment.");
    }

    // decide type
    const mtype = quoted.mtype || Object.keys(quoted.message || {})[0] || "";
    const options = { quoted: message };
    let messageContent = {};

    if (mtype.includes("image")) {
      messageContent = { image: buffer, caption: quoted.text || quoted.caption || "" };
    } else if (mtype.includes("video")) {
      messageContent = { video: buffer, caption: quoted.text || quoted.caption || "" };
    } else if (mtype.includes("audio")) {
      messageContent = { audio: buffer, mimetype: "audio/mp4", ptt: quoted.ptt || false };
    } else {
      return await client.sendMessage(from, {
        text: "❌ Only image, video, and audio messages are supported!"
      }, { quoted: message });
    }

    await client.sendMessage(from, messageContent, options);

  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + (error && error.message ? error.message : String(error))
    }, { quoted: message });
  }
});
