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
    if (!q) return reply("⚠️ Please give an audio URL!");

    const audioUrl = q.trim();

    reply("⬇️ Downloading audio...");

    // temp files
    const tempPath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const voicePath = path.join(__dirname, `../temp/${Date.now()}.opus`);

    // 1️⃣ DOWNLOAD AUDIO
    const audioRes = await fetch(audioUrl);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    fs.writeFileSync(tempPath, audioBuffer);

    reply("🎙 Converting to WhatsApp voice note...");

    // 2️⃣ CONVERT TO OPUS (WhatsApp voice pattern)
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

    // 3️⃣ SEND WHATSAPP VOICE (OGG OPCODE FORMAT)
    await conn.sendMessage(from, {
      audio: voiceBuffer,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
    }, { quoted: mek });

    reply("✅ Voice note sent!");

    // cleanup
    fs.unlinkSync(tempPath);
    fs.unlinkSync(voicePath);

  } catch (err) {
    console.error(err);
    reply("❌ Error converting audio. FFmpeg or URL issue.");
  }
});
