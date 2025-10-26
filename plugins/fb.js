const axios = require("axios");
const cheerio = require('cheerio');
const { cmd, commands } = require('../command');
const config = require('../config');
const { fetchJson } = require('../lib/functions');

const api = `https://nethu-api-ashy.vercel.app`;

// Fake ChatGPT vCard
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
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
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

    // 🟢 Fetch from API
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

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌙`;

    // Send thumb + caption first
    const sentMsg = await conn.sendMessage(from, {
      image: { url: fb.result.thumb },
      caption: caption
    }, { quoted: fakevCard });

    const messageID = sentMsg.key.id;

    // 🟣 Wait for user reply
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

        // 🕐 React to downloading
        await conn.sendMessage(from, { react: { text: "⬇️", key: mekInfo.key } });

        // 🟢 HD Video
        if (choice === "1") {
          if (!fb.result.hd) return reply("❌ HD video not available for this link.");
          await conn.sendMessage(from, {
            video: { url: fb.result.hd },
            mimetype: "video/mp4",
            caption: "*HD Quality Video* 🔋"
          }, { quoted: mek });

        // 🟡 SD Video
        } else if (choice === "2") {
          if (!fb.result.sd) return reply("❌ SD video not available for this link.");
          await conn.sendMessage(from, {
            video: { url: fb.result.sd },
            mimetype: "video/mp4",
            caption: "*SD Quality Video* 🪫"
          }, { quoted: mek });

        } else {
          return reply("❌ Invalid choice! Please reply with *1* or *2*.");
        }

        // ✅ React done
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
