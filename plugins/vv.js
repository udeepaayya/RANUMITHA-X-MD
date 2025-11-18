const { cmd } = require("../command");

let baileysDownloader = null;
try {
  // try to require baileys directly (works if installed)
  const baileys = require("@adiwajshing/baileys");
  baileysDownloader = baileys.downloadContentFromMessage || baileys.downloadMediaMessage || null;
} catch (e) {
  // not installed or inaccessible — that's OK, we'll try client helpers below
  baileysDownloader = null;
}

cmd({
  pattern: "vv",
  alias: ["viewonce", "rview"],
  react: "🫟",
  desc: "Owner/Bot - retrieve quoted view-once",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isOwner }) => {
  try {
    const botNumber = (client?.user?.id || "").split(":")[0] + "@s.whatsapp.net";
    const sender = message.sender || message.key?.participant || message.participant;
    const isBot = sender === botNumber;

    if (!isOwner && !isBot) {
      return await client.sendMessage(from, { text: "*🚫 Owner Only Command!*" }, { quoted: message });
    }

    if (!message.quoted) {
      return await client.sendMessage(from, { text: "*🍁 Please reply to a view-once message!*" }, { quoted: message });
    }

    // Normalize quoted -> real media message (handle viewOnce v1/v2/v2Extension)
    let quoted = message.quoted;
    let real = quoted.message || quoted;
    if (real.viewOnceMessage) real = real.viewOnceMessage.message;
    if (real.viewOnceMessageV2) real = real.viewOnceMessageV2.message;
    if (real.viewOnceMessageV2Extension) real = real.viewOnceMessageV2Extension.message;
    if (real.ephemeralMessage && real.ephemeralMessage.message) real = real.ephemeralMessage.message;

    const mediaType = Object.keys(real)[0] || ""; // e.g. imageMessage
    if (!mediaType) {
      return await client.sendMessage(from, { text: "❌ Could not find media in quoted message." }, { quoted: message });
    }

    // ---------------------------
    // Download using multiple fallbacks
    // ---------------------------
    let buffer = null;

    // 1) quoted.download() — some wrappers attach this directly
    if (typeof quoted.download === "function") {
      try {
        buffer = await quoted.download();
      } catch (e) {
        // continue to other fallbacks
      }
    }

    // 2) client.downloadMediaMessage (common in many wrappers)
    if (!buffer && typeof client.downloadMediaMessage === "function") {
      try {
        // some implementations expect quoted, others expect quoted.message
        try {
          buffer = await client.downloadMediaMessage(quoted, "buffer", {});
        } catch (err) {
          buffer = await client.downloadMediaMessage(quoted.message || quoted, "buffer", {});
        }
      } catch (e) {
        // ignore and try next
      }
    }

    // 3) baileys direct helper if available (downloadContentFromMessage)
    if (!buffer && baileysDownloader) {
      try {
        // baileysDownloader expects (messageProto, type) and returns a stream (async iterator)
        const type = mediaType.replace(/Message$/, ""); // image, video, audio, document
        const stream = await baileysDownloader(real[mediaType], type);
        const chunks = [];
        for await (const ch of stream) chunks.push(ch);
        buffer = Buffer.concat(chunks);
      } catch (e) {
        // ignore and try next
      }
    }

    // 4) client.mediaDownload or other custom helpers (best-effort)
    // Try common alternative names
    const altHelpers = ["downloadContentFromMessage", "downloadMedia", "downloadMediaMessage", "downloadAndSaveMediaMessage"];
    if (!buffer) {
      for (const h of altHelpers) {
        if (typeof client[h] === "function") {
          try {
            buffer = await client[h](real[mediaType], mediaType.replace(/Message$/, ""));
            // client functions might return Buffer directly or a stream
            if (!Buffer.isBuffer(buffer) && buffer && typeof buffer.on === "function") {
              // it's a stream -> collect
              const chunks = [];
              for await (const ch of buffer) chunks.push(ch);
              buffer = Buffer.concat(chunks);
            }
            if (Buffer.isBuffer(buffer)) break;
          } catch (e) {
            buffer = null;
          }
        }
      }
    }

    if (!buffer) {
      // nothing worked — tell user what to check
      return await client.sendMessage(from, {
        text: "❌ Could not download media: no supported download helper available in this runtime.\n\nPossible fixes:\n1) Install `@adiwajshing/baileys` (v4/v5) in your project.\n2) Use a wrapper that exposes `client.downloadMediaMessage` or `quoted.download()`.\n3) Send me the bot logs / environment so I can adapt the helper names."
      }, { quoted: message });
    }

    // ---------------------------
    // Send back depending on mediaType
    // ---------------------------
    let out = {};
    if (mediaType.includes("image")) {
      out = { image: buffer, caption: real[mediaType].caption || "" };
    } else if (mediaType.includes("video")) {
      out = { video: buffer, caption: real[mediaType].caption || "" };
    } else if (mediaType.includes("audio")) {
      out = { audio: buffer, mimetype: "audio/mp4", ptt: real[mediaType].ptt || false };
    } else if (mediaType.includes("document")) {
      out = { document: buffer, fileName: real[mediaType].fileName || "file" };
    } else {
      return await client.sendMessage(from, { text: "❌ Unsupported media type." }, { quoted: message });
    }

    await client.sendMessage(from, out, { quoted: message });

  } catch (err) {
    console.error("VV Handler Error:", err);
    await client.sendMessage(message.from || from, { text: "❌ *VV Error:* " + (err && err.message ? err.message : String(err)) }, { quoted: message });
  }
});
