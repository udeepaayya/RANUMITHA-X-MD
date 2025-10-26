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

// 🟣 Command definition
cmd({
  pattern: "song",
  alias: ["play", "song1","play1"],
  react: "🎵",
  desc: "Download YouTube song (Audio) via Nekolabs API",
  category: "download",
  use: ".play <song name or link>",
  filename: __filename,
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("⚠️ Please provide a song name or YouTube link.");

    const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(q)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.success || !data?.result?.downloadUrl) {
      return reply("❌ Song not found or API error. Try again later.");
    }

    const meta = data.result.metadata;
    const dlUrl = data.result.downloadUrl;

    // 🟣 Try fetching thumbnail
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
🌐 *Url:* ${meta.url}

🔽 *Reply with your choice:*
1. *Audio Type* 🎵
2. *Document Type* 📁
3. *Voice Note Type* 🎤

> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    const sentMsg = await conn.sendMessage(from, {
      image: buffer,
      caption: caption,
    }, { quoted: fakevCard });

    const messageID = sentMsg.key.id;

    // 🟢 Listen for user reply
    conn.ev.on("messages.upsert", async (msgUpdate) => {
      try {
        const mekInfo = msgUpdate?.messages?.[0];
        if (!mekInfo?.message) return;

        const userText =
          mekInfo?.message?.conversation ||
          mekInfo?.message?.extendedTextMessage?.text;

        const isReply =
          mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

        if (!isReply) return;

        const choice = userText.trim();
        await conn.sendMessage(from, { react: { text: "⬇️", key: mekInfo.key } });

        const safeTitle = meta.title.replace(/[\\/:*?"<>|]/g, "").slice(0, 80);
        const audioFileName = `${safeTitle}.mp3`;
        const tempPath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
        const voicePath = path.join(__dirname, `../temp/${Date.now()}.opus`);

        let type;

        // ✅ Choice 1: Audio
        if (choice === "1") {
          type = {
            audio: { url: dlUrl },
            mimetype: "audio/mpeg",
            fileName: audioFileName,
          };

        // ✅ Choice 2: Document
        } else if (choice === "2") {
          type = {
            document: { url: dlUrl },
            mimetype: "audio/mpeg",
            fileName: audioFileName,
            caption: meta.title,
          };

        // ✅ Choice 3: Voice note (convert to .opus)
        } else if (choice === "3") {
          const audioRes = await fetch(dlUrl);
          const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
          fs.writeFileSync(tempPath, audioBuffer);

          // convert to opus (WhatsApp voice note format)
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

          type = {
            audio: voiceBuffer,
            mimetype: "audio/ogg; codecs=opus", // ✅ True WhatsApp format
            ptt: true,
          };

          // clean temp
          fs.unlinkSync(tempPath);
          fs.unlinkSync(voicePath);

        } else {
          return reply("❌ Invalid choice! Reply with 1, 2 or 3.");
        }

        await conn.sendMessage(from, { react: { text: "⬆️", key: mekInfo.key } });
        await conn.sendMessage(from, type, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mekInfo.key } });

      } catch (err) {
        console.error("reply handler error:", err);
        reply("⚠️ Error while processing your reply.");
      }
    });

  } catch (err) {
    console.error("song cmd error:", err);
    reply("⚠️ An error occurred while processing your request.");
  }
});
