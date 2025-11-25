const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

// Fake vCard
const fakevCard = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "© Mr Hiruka",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=94762095304:+94762095304
END:VCARD`
        }
    }
};

cmd({
  pattern: "csong",
  alias: ["chsong", "channelplay"],
  react: "🍁",
  desc: "Send a YouTube song to a WhatsApp Channel (voice + details)",
  category: "channel",
  use: ".csong <song name or youtube link>/<channel JID>",
  filename: __filename,
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q || !q.includes("/")) {
      return reply("⚠️ Use format:\n.csong <song name or youtube url>/<channel JID>\n\nExample:\n.csong https://youtu.be/xxxxx /1203630xxxxx@newsletter");
    }

    // ============================
    // FIXED: Split ONLY at last "/"
    // ============================
    const lastSlash = q.lastIndexOf("/");
    const songInput = q.substring(0, lastSlash).trim();
    const channelJid = q.substring(lastSlash + 1).trim();

    if (!channelJid.endsWith("@newsletter")) {
      return reply("❌ Invalid channel JID! It should end with @newsletter");
    }

    if (!songInput) return reply("⚠️ Please provide a valid song name or link.");

    // Detect input type
    const isUrl = songInput.startsWith("http://") || songInput.startsWith("https://");

    // API Request
    const apiUrl = isUrl
      ? `https://api.nekolabs.my.id/downloader/youtube/play/v1?url=${encodeURIComponent(songInput)}`
      : `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(songInput)}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.success || !data?.result?.downloadUrl) {
      return reply("❌ Song not found or API returned an error.");
    }

    const meta = data.result.metadata;
    const dlUrl = data.result.downloadUrl;

    // Download thumbnail
    let buffer = null;
    try {
      const thumbRes = await fetch(meta.cover);
      buffer = Buffer.from(await thumbRes.arrayBuffer());
    } catch (e) {
      buffer = null;
    }

    // Caption
    const caption = `🎶 *RANUMITHA-X-MD SONG SENDER* 🎶

🎧 *Title:* ${meta.title}
📀 *Channel:* ${meta.channel}
⏱ *Duration:* ${meta.duration}
🔗 *URL:* ${meta.url}

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    // Send thumbnail + caption
    await conn.sendMessage(
      channelJid,
      { image: buffer, caption },
      { quoted: fakevCard }
    );

    // ============================
    // Convert MP3 → OPUS (voice note)
    // ============================
    const tempPath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const voicePath = path.join(__dirname, `../temp/${Date.now()}.opus`);

    const audioRes = await fetch(dlUrl);
    fs.writeFileSync(tempPath, Buffer.from(await audioRes.arrayBuffer()));

    // FFMPEG convert
    await new Promise((resolve, reject) => {
      ffmpeg(tempPath)
        .audioCodec("libopus")
        .format("opus")
        .audioBitrate("64k")
        .save(voicePath)
        .on("end", resolve)
        .on("error", reject);
    });

    const voiceBuffer = fs.readFileSync(voicePath);

    // Send voice
    await conn.sendMessage(
      channelJid,
      { audio: voiceBuffer, mimetype: "audio/ogg; codecs=opus", ptt: true },
      { quoted: fakevCard }
    );

    // Delete temp files
    fs.unlinkSync(tempPath);
    fs.unlinkSync(voicePath);

    reply(`*✅ Song sent successfully!*\n\n🎧 *${meta.title}*\n📩 *Channel:* ${channelJid}`);

  } catch (err) {
    console.error("csong error:", err);
    reply("⚠️ Error while sending song to channel.");
  }
});
