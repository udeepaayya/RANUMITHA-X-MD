const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

cmd({
  pattern: "csong",
  alias: ["chsong", "channelplay"],
  react: "🍁",
  desc: "Send a YouTube song to a WhatsApp Channel",
  category: "channel",
  use: ".csong <song>/<channel jid>",
  filename: __filename,
}, async (conn, mek, m, { reply, q }) => {
  try {

    // Format check
    if (!q || !q.includes("/")) {
      return reply("⚠️ Use: .csong <song>/<channel jid>\n\nExample:\n.csong Shape of You/1203xxxxxx@newsletter");
    }

    const [songName, channelJid] = q.split("/").map(x => x.trim());

    if (!channelJid.endsWith("@newsletter")) {
      return reply("❌ Invalid Channel JID! Must end with @newsletter");
    }

    // API fetch
    const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(songName)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.success) {
      return reply("❌ Song not found or API error!");
    }

    const meta = data.result.metadata;

    // Download URL fallback
    const dlUrl =
      data?.result?.downloadUrl ||
      data?.result?.audio?.[0]?.url;

    if (!dlUrl) return reply("❌ Audio URL missing!");

    // Thumbnail
    let thumb = null;
    try {
      let imgRes = await fetch(meta.cover);
      thumb = Buffer.from(await imgRes.arrayBuffer());
    } catch { }

    // Caption
    const caption = `🎶 *RANUMITHA-X-MD SONG SENDER*

🎧 *Title:* ${meta.title}
📀 *Channel:* ${meta.channel}
⏱ Duration: ${meta.duration}

> © Powered by RANUMITHA-X-MD 🌛`;

    // Send song details (no quoted)
    await conn.sendMessage(channelJid, {
      image: thumb,
      caption
    });

    // Temp path
    const mp3 = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const opus = path.join(__dirname, `../temp/${Date.now()}.opus`);

    // Download audio
    const aRes = await fetch(dlUrl);
    const aBuf = Buffer.from(await aRes.arrayBuffer());
    fs.writeFileSync(mp3, aBuf);

    // Convert to opus
    await new Promise((resolve, reject) => {
      ffmpeg(mp3)
        .audioCodec("libopus")
        .format("opus")
        .save(opus)
        .on("end", resolve)
        .on("error", reject);
    });

    const vBuf = fs.readFileSync(opus);

    // Send to channel (no quoted)
    await conn.sendMessage(channelJid, {
      audio: vBuf,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true
    });

    // Cleanup
    fs.unlinkSync(mp3);
    fs.unlinkSync(opus);

    reply(`✅ *Song sent successfully!*\n\n📌 *${meta.title}*\n📨 *Channel:* ${channelJid}`);

  } catch (err) {
    console.error(err);
    reply("⚠️ Error while sending song!");
  }
});
