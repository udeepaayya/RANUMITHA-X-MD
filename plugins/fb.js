const axios = require("axios");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const { cmd } = require('../command');
const config = require('../config');
const { fetchJson } = require('../lib/functions');

const api = `https://nethu-api-ashy.vercel.app`;

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
  pattern: "facebook",
  react: "🎥",
  alias: ["fbb", "fbvideo", "fb"],
  desc: "Download videos from Facebook",
  category: "download",
  use: ".facebook <facebook_url>",
  filename: __filename
},
async (conn, mek, m, { from, prefix, q, reply }) => {
  try {
    if (!q) return reply("🚩 Please give me a valid Facebook URL 🐼");

    const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(q)}`);
    if (!fb.result || (!fb.result.sd && !fb.result.hd)) {
      return reply("❌ I couldn't find anything. Please check the link.");
    }

    const caption = `🎥 *RANUMITHA-X-MD FACEBOOK DOWNLOADER* 🎥

📝 *Title:* Facebook Video
🔗 *URL:* ${q}

💬 *Reply with your choice:*
1️⃣ HD Quality 🔋
2️⃣ SD Quality 🪫
3️⃣ Audio Only 🎧

> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: fb.result.thumb },
      caption: caption
    }, { quoted: fakevCard });

    const messageID = sentMsg.key.id;

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

        // HD
        if (choice === "1") {
          if (!fb.result.hd) return reply("❌ HD video not available.");
          await conn.sendMessage(from, {
            video: { url: fb.result.hd },
            mimetype: "video/mp4",
            caption: "*HD Quality Video* 🔋"
          }, { quoted: mek });
        }
        // SD
        else if (choice === "2") {
          if (!fb.result.sd) return reply("❌ SD video not available.");
          await conn.sendMessage(from, {
            video: { url: fb.result.sd },
            mimetype: "video/mp4",
            caption: "*SD Quality Video* 🪫"
          }, { quoted: mek });
        }
        // AUDIO
        else if (choice === "3") {
          reply("🎧 Extracting audio, please wait...");

          const videoUrl = fb.result.sd || fb.result.hd;
          if (!videoUrl) return reply("❌ No video source available to extract audio.");

          const tmpVideo = path.join(__dirname, `fb_${Date.now()}.mp4`);
          const tmpAudio = path.join(__dirname, `fb_${Date.now()}.mp3`);

          // Download video first
          const writer = fs.createWriteStream(tmpVideo);
          const response = await axios({ url: videoUrl, method: "GET", responseType: "stream" });
          response.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });

          // Extract audio with ffmpeg
          await new Promise((resolve, reject) => {
            exec(`ffmpeg -i "${tmpVideo}" -q:a 0 -map a "${tmpAudio}" -y`, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          await conn.sendMessage(from, {
            audio: { url: tmpAudio },
            mimetype: "audio/mpeg",
            fileName: "Facebook_Audio.mp3",
            ptt: false,
            caption: "*Facebook Audio Only* 🎧"
          }, { quoted: mek });

          // Clean up temp files
          fs.unlinkSync(tmpVideo);
          fs.unlinkSync(tmpAudio);
        }
        else {
          return reply("❌ Invalid choice! Please reply with *1*, *2*, or *3*.");
        }

        await conn.sendMessage(from, { react: { text: "✅", key: mekInfo.key } });

      } catch (err) {
        console.error("reply handler error:", err);
        reply("⚠️ Error while processing your reply.");
      }
    });

  } catch (err) {
    console.error(err);
    reply("💔 Failed to download the video. Please try again later 🐼");
  }
});
