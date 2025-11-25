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
    remoteJid: "status@broadcast",
  },
  message: {
    contactMessage: {
      displayName: "© Mr Hiruka",
      vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=94762095304:+94762095304
END:VCARD`,
    },
  },
};

// ==================== MAIN COMMAND ======================
cmd(
  {
    pattern: "song",
    alias: ["play", "song1", "play1"],
    react: "🎵",
    desc: "Download YouTube song (Audio) via Nekolabs API",
    category: "download",
    use: ".song <query>",
    filename: __filename,
  },

  async (conn, mek, m, { from, reply, q }) => {
    try {
      // 🟣 Get query
      let query = q?.trim();

      if (!query && m?.quoted) {
        query =
          m.quoted.message?.conversation ||
          m.quoted.message?.extendedTextMessage?.text ||
          m.quoted.text;
      }

      if (!query) return reply("⚠️ Please provide a song name or YouTube link.");

      // Shorts Fix
      if (query.includes("youtube.com/shorts/")) {
        const videoId = query.split("/shorts/")[1].split(/[?&]/)[0];
        query = `https://www.youtube.com/watch?v=${videoId}`;
      }

      // API Fetch
      const apiUrl = `https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(query)}`;
      const res = await fetch(apiUrl);
      const data = await res.json();

      if (!data?.success || !data?.result?.downloadUrl) {
        return reply("❌ Song not found or API error.");
      }

      const meta = data.result.metadata;
      const dlUrl = data.result.downloadUrl;

      // Thumbnail
      let buffer;
      try {
        const thumbRes = await fetch(meta.cover);
        buffer = Buffer.from(await thumbRes.arrayBuffer());
      } catch {
        buffer = null;
      }

      // Caption
      const caption = `
🎶 *RANUMITHA-X-MD SONG DOWNLOADER* 🎶

📑 *Title:* ${meta.title}
📡 *Channel:* ${meta.channel}
⏱ *Duration:* ${meta.duration}
🌐 *Url:* ${meta.url}

🔽 *Reply with your choice:*

1. *Audio Type* 🎵
2. *Document Type* 📁
3. *Voice Note Type* 🎤

© Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

      const sentMsg = await conn.sendMessage(
        from,
        { image: buffer, caption: caption },
        { quoted: fakevCard }
      );

      const expectedReplyID = sentMsg.key.id;

      // ===================== REPLY LISTENER ======================
      const listener = async (msgUpdate) => {
        try {
          const info = msgUpdate.messages[0];
          if (!info?.message) return;

          const userText =
            info.message.conversation ||
            info.message.extendedTextMessage?.text;

          // Check reply target
          const isReply =
            info?.message?.extendedTextMessage?.contextInfo?.stanzaId ===
            expectedReplyID;

          if (!isReply) return;

          const choice = userText.trim();

          // ⬇️ Download React
          await conn.sendMessage(from, {
            react: { text: "⬇️", key: info.key },
          });

          // File Prep
          const cleanTitle = meta.title.replace(/[\\/:*?"<>|]/g, "").slice(0, 60);
          const mp3Path = path.join(__dirname, `../temp/${Date.now()}.mp3`);
          const opusPath = path.join(__dirname, `../temp/${Date.now()}.opus`);

          // ===================== USER OPTIONS ======================
          if (choice === "1") {
            // AUDIO TYPE
            await conn.sendMessage(
              from,
              {
                audio: { url: dlUrl },
                mimetype: "audio/mpeg",
                fileName: cleanTitle + ".mp3",
              },
              { quoted: mek }
            );
          } else if (choice === "2") {
            // DOCUMENT TYPE
            await conn.sendMessage(
              from,
              {
                document: { url: dlUrl },
                mimetype: "audio/mpeg",
                fileName: cleanTitle + ".mp3",
                caption: meta.title,
              },
              { quoted: mek }
            );
          } else if (choice === "3") {
            // VOICE NOTE TYPE
            const audioRes = await fetch(dlUrl);
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

            const voiceBuffer = fs.readFileSync(opusPath);

            await conn.sendMessage(
              from,
              {
                audio: voiceBuffer,
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              },
              { quoted: mek }
            );

            fs.unlinkSync(mp3Path);
            fs.unlinkSync(opusPath);
          } else {
            return reply("*❌ Invalid choice!*");
          }

          // ⬆️ Upload react
          await conn.sendMessage(from, {
            react: { text: "⬆️", key: info.key },
          });

          // ✔️ Success react
          await conn.sendMessage(from, {
            react: { text: "✔️", key: info.key },
          });

          // Remove listener after success
          conn.ev.off("messages.upsert", listener);

        } catch (err) {
          console.error("reply handler error:", err);
        }
      };

      conn.ev.on("messages.upsert", listener);

    } catch (err) {
      console.error("song cmd error:", err);
      reply("⚠️ Error occurred while processing your request.");
    }
  }
);
