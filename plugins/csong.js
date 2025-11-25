const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

cmd({
  pattern: "csong",
  alias: ["chsong", "channelplay"],
  react: "🎤",
  desc: "Send song as voice-like audio to channel",
  category: "channel",
  filename: __filename
},
async (client, message, match, { reply }) => {
  try {

    if (!match || !match.includes("/"))
      return reply("⚠️ Format:\n.csong <song>/<channel JID>");

    const [songName, channelJid] = match.split("/").map(x => x.trim());

    if (!channelJid.endsWith("@newsletter"))
      return reply("❌ Invalid Channel JID");

    // API FETCH
    const api = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(songName)}`;
    const res = await fetch(api);
    const data = await res.json();

    if (!data?.success) return reply("❌ Song not found");

    const meta = data.result.metadata;
    const url = data.result.downloadUrl;

    // THUMBNAIL
    let thumb = null;
    try {
      const r = await fetch(meta.cover);
      thumb = Buffer.from(await r.arrayBuffer());
    } catch { thumb = null; }

    const caption = `🎶 *RANUMITHA-X-MD SONG SENDER* 🎶

🎧 *Title:* ${meta.title}
📀 *Channel:* ${meta.channel}
⏱ *Duration:* ${meta.duration}
🔗 *URL:* ${meta.url}

> © RANUMITHA-X-MD`;

    // Send Caption/Thumbnail
    await client.sendMessage(
      channelJid,
      thumb ? { image: thumb, caption } : { text: caption }
    );

    // ===== DOWNLOAD Source MP3 =====
    const mp3 = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const voice = path.join(__dirname, `../temp/${Date.now()}.opus`);

    const audioRes = await fetch(url);
    fs.writeFileSync(mp3, Buffer.from(await audioRes.arrayBuffer()));

    // ===== CONVERT to OPUS (VOICE MODE) =====
    await new Promise((resolve, reject) => {
      ffmpeg(mp3)
        .audioCodec("libopus")
        .audioBitrate("64k")
        .format("opus")   // voice-like
        .save(voice)
        .on("end", resolve)
        .on("error", reject);
    });

    const voiceData = fs.readFileSync(voice);

    // ===== SEND TO CHANNEL (VOICE STYLE AUDIO) =====
    await client.sendMessage(channelJid, {
      audio: voiceData,
      mimetype: "audio/ogg; codecs=opus",
      ptt: false     // IMPORTANT: Channel accepts only if ptt=false
    });

    fs.unlinkSync(mp3);
    fs.unlinkSync(voice);

    reply(`✅ Voice-style song sent!\n🎧 ${meta.title}`);

  } catch (e) {
    console.log(e);
    reply("💢 Error: " + e.message);
  }
});
