const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

cmd({
  pattern: "csong",
  alias: ["chsong", "channelplay"],
  react: "🎤",
  desc: "Send YouTube song as voice-style audio to a channel",
  category: "channel",
  filename: __filename
},
async (client, message, match, { reply }) => {
  try {
    // ===== Safe match parsing =====
    let songQuery = "";
    if (typeof match === "string") songQuery = match.trim();
    else if (Array.isArray(match)) songQuery = match.join(" ").trim();
    else if (match && typeof match === "object") songQuery = match.text || "";
    else songQuery = "";

    if (!songQuery || !songQuery.includes("/"))
      return reply("⚠️ Format:\n.csong <song>/<channel JID>\nExample: .csong Shape of You/1203xxxxxxx@newsletter");

    const [songName, channelJid] = songQuery.split("/").map(x => x.trim());

    if (!channelJid.endsWith("@newsletter"))
      return reply("❌ Invalid Channel JID! Must end with @newsletter");

    // ===== Fetch song metadata =====
    const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(songName)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.success) return reply("❌ Song not found!");

    const meta = data.result.metadata;
    const dlUrl = data.result.downloadUrl || data.result.audio?.[0]?.url;

    if (!dlUrl) return reply("❌ Audio URL missing!");

    // ===== Thumbnail fetch (optional) =====
    let thumb = null;
    try {
      const t = await fetch(meta.cover);
      thumb = Buffer.from(await t.arrayBuffer());
    } catch { thumb = null; }

    const caption = `🎶 *RANUMITHA-X-MD SONG SENDER* 🎶

🎧 *Title:* ${meta.title}
📀 *Channel:* ${meta.channel}
⏱ *Duration:* ${meta.duration}
🔗 *URL:* ${meta.url}

> © RANUMITHA-X-MD`;

    // ===== Send caption + thumbnail =====
    await client.sendMessage(channelJid, thumb ? { image: thumb, caption } : { text: caption });

    // ===== Download song =====
    const mp3Path = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const voicePath = path.join(__dirname, `../temp/${Date.now()}.opus`);

    const audioRes = await fetch(dlUrl);
    fs.writeFileSync(mp3Path, Buffer.from(await audioRes.arrayBuffer()));

    // ===== Convert to voice-style OGG/OPUS =====
    await new Promise((resolve, reject) => {
      ffmpeg(mp3Path)
        .audioCodec("libopus")
        .format("opus")
        .audioBitrate("64k")
        .save(voicePath)
        .on("end", resolve)
        .on("error", reject);
    });

    const voiceBuffer = fs.readFileSync(voicePath);

    // ===== Send voice-style audio (ptt=false) =====
    await client.sendMessage(channelJid, {
      audio: voiceBuffer,
      mimetype: "audio/ogg; codecs=opus",
      ptt: false
    });

    // ===== Cleanup temp files =====
    fs.unlinkSync(mp3Path);
    fs.unlinkSync(voicePath);

    reply(`✅ Voice-style song sent!\n🎧 ${meta.title}`);

  } catch (e) {
    console.log("csong error:", e);
    reply("💢 Error: " + e.message);
  }
});
