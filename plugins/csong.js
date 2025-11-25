const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

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
    // Format validation
    if (!q || !q.includes("/")) {
      return reply(
        "⚠️ Use format:\n.csong <song name>/<channel JID>\n\nExample:\n.csong Shape of You/1203xxxxxxx@newsletter"
      );
    }

    const [songName, channelJid] = q.split("/").map(x => x.trim());

    // Channel JID validation
    if (!channelJid.endsWith("@newsletter")) {
      return reply("❌ Invalid channel JID! It must end with @newsletter");
    }

    if (!songName) {
      return reply("⚠️ Please provide a valid song name.");
    }

    // Fetch song details
    const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(songName)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.success) {
      return reply("❌ Song not found or API error.");
    }

    const meta = data.result.metadata;

    // Fallback for audio URL
    const dlUrl =
      data?.result?.downloadUrl ||
      data?.result?.audio?.[0]?.url;

    if (!dlUrl) {
      return reply("❌ Audio URL missing!");
    }

    // Thumbnail fetch attempt
    let thumb = null;
    try {
      const tRes = await fetch(meta.cover);
      thumb = Buffer.from(await tRes.arrayBuffer());
    } catch {
      thumb = null;
    }

    const caption = `🎶 *RANUMITHA-X-MD SONG SENDER* 🎶

🎧 *Title:* ${meta.title}
📀 *Channel:* ${meta.channel}
⏱ Duration:* ${meta.duration}
🔗 *URL:* ${meta.url}

> © Powered by 𝗥𝗔𝗡𝗨𝗠ි𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    // Channel sends
    if (thumb) {
      await conn.sendMessage(channelJid, {
        image: thumb,
        caption: caption
      });
    } else {
      await conn.sendMessage(channelJid, {
        text: caption
      });
    }

    // Download mp3
    const mp3Path = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const audioRes = await fetch(dlUrl);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    fs.writeFileSync(mp3Path, audioBuffer);

    const audioFile = fs.readFileSync(mp3Path);

    // Send MP3 audio (not voice note)
    await conn.sendMessage(channelJid, {
      audio: audioFile,
      mimetype: "audio/mpeg",
      ptt: false
    });

    // Delete temp file
    fs.unlinkSync(mp3Path);

    reply(`✅ *Song sent successfully!*\n\n🎵 *${meta.title}*\n📨 *Channel:* ${channelJid}`);

  } catch (err) {
    console.error("csong error:", err);
    reply("⚠️ Error while sending song to channel.");
  }
});
