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
  desc: "Send a YouTube song to a WhatsApp Channel",
  category: "channel",
  use: ".csong <song name or url>/<channel jid>",
  filename: __filename,
}, async (conn, mek, m, { reply, q }) => {
  try {
    if (!q || !q.includes("/"))
      return reply("❗ Use: `.csong <song name or youtube url>/<channel@newsletter>`");

    // Split at last slash (fix)
    const lastSlash = q.lastIndexOf("/");
    const songInput = q.substring(0, lastSlash).trim();
    const channelJid = q.substring(lastSlash + 1).trim();

    if (!channelJid.endsWith("@newsletter"))
        return reply("❌ Invalid channel JID. Must end with @newsletter");

    let apiUrl;
    let meta = {};
    let downloadUrl = "";

    // ===============  CHECK IF INPUT IS URL  =================
    const isUrl = songInput.startsWith("http://") || songInput.startsWith("https://");

    if (isUrl) {
        // ---- Download from YouTube link ----
        apiUrl = `https://yt-api.eu.org/api/ytmp3?url=${encodeURIComponent(songInput)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.status) return reply("❌ Invalid YouTube link!");

        meta.title = json.title;
        meta.channel = json.channel;
        meta.duration = json.duration;
        meta.cover = json.thumbnail;
        meta.url = songInput;
        downloadUrl = json.url;

    } else {
        // ---- Search by name ----
        apiUrl = `https://yt-api.eu.org/api/play?query=${encodeURIComponent(songInput)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json.status) return reply("❌ No results found!");

        meta.title = json.title;
        meta.channel = json.channel;
        meta.duration = json.duration;
        meta.cover = json.thumbnail;
        meta.url = json.url;
        downloadUrl = json.downloadUrl;
    }

    // Download thumbnail
    let thumb = null;
    try {
        const img = await fetch(meta.cover);
        thumb = Buffer.from(await img.arrayBuffer());
    } catch {}

    // Caption
    const caption = `🎶 *RANUMITHA-X-MD* 🎶

🎧 *Title:* ${meta.title}
📺 *Channel:* ${meta.channel}
⏱ *Duration:* ${meta.duration}
🔗 *URL:* ${meta.url}

> © Powered by RANUMITHA-X-MD`;

    // Send details + thumbnail
    await conn.sendMessage(channelJid, { image: thumb, caption }, { quoted: fakevCard });

    // MP3 → OPUS convert
    const mp3Path = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const opusPath = path.join(__dirname, `../temp/${Date.now()}.opus`);

    const audioRes = await fetch(downloadUrl);
    fs.writeFileSync(mp3Path, Buffer.from(await audioRes.arrayBuffer()));

    await new Promise((resolve, reject) => {
      ffmpeg(mp3Path)
        .audioCodec("libopus")
        .format("opus")
        .audioBitrate("64k")
        .save(opusPath)
        .on("end", resolve)
        .on("error", reject);
    });

    const voice = fs.readFileSync(opusPath);

    await conn.sendMessage(channelJid, {
      audio: voice,
      ptt: true,
      mimetype: "audio/ogg; codecs=opus",
    }, { quoted: fakevCard });

    fs.unlinkSync(mp3Path);
    fs.unlinkSync(opusPath);

    reply(`✅ Sent: *${meta.title}*`);

  } catch (e) {
    console.log("csong error:", e);
    reply("⚠️ Unexpected error occurred.");
  }
});
