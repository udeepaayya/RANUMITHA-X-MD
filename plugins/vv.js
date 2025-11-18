const { cmd } = require("../command");
let maybeDownloadContentFromMessage;
try {
  maybeDownloadContentFromMessage = require('@adiwajshing/baileys').downloadContentFromMessage;
} catch (e) {}

cmd({
  pattern: "vv",
  alias: ["viewonce", "rview"],
  react: "🫟",
  desc: "Owner Only - retrieve quoted view-once message",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isOwner }) => {
  try {
    const botNumber = client.user.id.split(":")[0] + "@s.whatsapp.net";

    // Allow Owner + Bot Number
    const sender = message.sender || message.key.participant || message.participant;
    const isBot = sender === botNumber;

    if (!isOwner && !isBot) {
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

    if (typeof quoted.download === "function") {
      buffer = await quoted.download();
    } else if (typeof client.downloadMediaMessage === "function") {
      try {
        buffer = await client.downloadMediaMessage(quoted, "buffer", {});
      } catch (err) {
        buffer = await client.downloadMediaMessage(quoted.message || quoted, "buffer", {});
      }
    } else if (maybeDownloadContentFromMessage && quoted.message) {
      const messageType = Object.keys(quoted.message)[0];
      const stream = await maybeDownloadContentFromMessage(
        quoted.message[messageType],
        messageType.replace(/Message$/, '').toLowerCase()
      );
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      buffer = Buffer.concat(chunks);
    } else {
      throw new Error("No download method available.");
    }

    const mtype = quoted.mtype || Object.keys(quoted.message || {})[0] || "";
    let content = {};

    if (mtype.includes("image")) {
      content = { image: buffer, caption: quoted.text || quoted.caption || "" };
    } else if (mtype.includes("video")) {
      content = { video: buffer, caption: quoted.text || quoted.caption || "" };
    } else if (mtype.includes("audio")) {
      content = { audio: buffer, mimetype: "audio/mp4", ptt: quoted.ptt || false };
    } else {
      return await client.sendMessage(from, {
        text: "❌ Only image, video and audio view-once are supported!"
      }, { quoted: message });
    }

    await client.sendMessage(from, content, { quoted: message });

  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + (error.message || error)
    }, { quoted: message });
  }
});
