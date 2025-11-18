const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

cmd({
  pattern: "getvoice",
  alias: ["gv"],
  desc: "Convert any audio URL into WhatsApp Voice Note",
  category: "owner",
  react: "🎤",
  use: ".getvoice <audio-url>",
  filename: __filename,
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) {
      return await conn.sendMessage(from, { 
        react: { text: "⚠️", key: mek.key }
      });
    }

    const audioUrl = q.trim();

    // ⬇️ React: Downloading
    await conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });

    const tempPath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const voicePath = path.join(__dirname, `../temp/${Date.now()}.opus`);

    // DOWNLOAD AUDIO
    const audioRes = await fetch(audioUrl);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    fs.writeFileSync(tempPath, audioBuffer);

    // ⬆️ React: Converting
    await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

    // CONVERT TO OPUS
    await new Promise((resolve, reject) => {
      ffmpeg(tempPath)
        .audioCodec("libopus")
        .format("opus")
        .audioBitrate("64k")
        .on("end", resolve)
        .on("error", reject)
        .save(voicePath);
    });

    const voiceBuffer = fs.readFileSync(voicePath);

    // SEND VOICE NOTE
    await conn.sendMessage(from, {
      audio: voiceBuffer,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    });

    // React: Done
    await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

    // cleanup
    fs.unlinkSync(tempPath);
    fs.unlinkSync(voicePath);

  } catch (err) {
    console.error(err);
    await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
  }
});
