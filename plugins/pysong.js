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
  react: "📡",
  desc: "Send a YouTube song to a WhatsApp Channel (voice + details)",
  category: "channel",
  use: ".csong <song name> <channel JID>",
  filename: __filename,
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("⚠️ Use: .csong <song name> <channel JID>");

    const args = q.split(" ");
    const channelJid = args.pop(); // last part = channel JID
    const query = args.join(" ");

    if (!channelJid.endsWith("@newsletter")) {
      return reply("❌ Invalid channel JID! It should end with @newsletter");
    }

    if (!query) return reply("⚠️ Please provide a song name.");

    // Fetch song details from Nekolabs API
    const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(query)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.success || !data?.result?.downloadUrl) {
      return reply("❌ Song not found or API error.");
    }

    const meta = data.result.metadata;
    const dlUrl = data.result.downloadUrl;

    // Try fetching thumbnail
    let buffer;
    try {
      const thumbRes = await fetch(meta.cover);
      buffer = Buffer.from(await thumbRes.arrayBuffer());
    } catch {
      buffer = null;
    }

    const caption = `🎶 *RANUMITHA-X-MD SONG DOWNLOADER* 🎶

📑 *Title:* ${meta.title}
📡 *Channel:* ${meta.channel}
⏱ *Duration:* ${meta.duration}
🌐 *URL:* ${meta.url}

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    // Send details + image to channel
    await conn.sendMessage(channelJid, {
      image: buffer,
      caption: caption
    }, { quoted: fakevCard });

    // Download and convert to voice (opus)
    const tempPath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const voicePath = path.join(__dirname, `../temp/${Date.now()}.opus`);

    const audioRes = await fetch(dlUrl);
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
    fs.writeFileSync(tempPath, audioBuffer);

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

    // Send as voice note to the channel
    await conn.sendMessage(channelJid, {
      audio: voiceBuffer,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true
    }, { quoted: fakevCard });

    // Clean up
    fs.unlinkSync(tempPath);
    fs.unlinkSync(voicePath);

    reply(`✅ Song sent successfully to ${channelJid}`);

  } catch (err) {
    console.error("csong error:", err);
    reply("⚠️ Error sending song to channel.");
  }
});
