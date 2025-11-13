const axios = require("axios");
const { cmd } = require('../command');

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
TEL;type=CELL;type=VOICE;waid=94762095304:+94762095304
END:VCARD`
        }
    }
};

// ─────────────────────────────────────────────
// 🌀 FACEBOOK DOWNLOADER (API 1 - ASWIN API)
// ─────────────────────────────────────────────
cmd({
  pattern: "fb",
  alias: ["facebook", "fbdowonload", "fbvideo"], 
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Facebook video URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.status || !data?.data) {
      return reply("⚠️ Failed to retrieve Facebook media. Please check the link and try again.");
    }

    const { title, thumbnail, low, high } = data.data;

    // 🖼️ Use video thumbnail if available, else fallback
    const thumb = thumbnail || "https://files.catbox.moe/36ndl3.jpg";

    const caption = `
🎥 *RANUMITHA-X-MD FACEBOOK DOWNLOADER* 🎥

📑 *Title:* ${title || "No title"}
🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣ SD Quality🪫
2️⃣ HD Quality🔋
3️⃣ Audio typ 🎶

> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumb },
      caption,
      contextInfo: {
        externalAdReply: {
          title: title || "Facebook Video",
          body: "Click below to open on Facebook",
          thumbnailUrl: thumb,
          mediaType: 1,
          sourceUrl: q
        }
      }
    }, { quoted: fakevCard });

    const messageID = sentMsg.key.id;

    // 🧠 Reply listener
    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        const text = receivedText.trim();

        await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

        try {
          switch (text) {
            case "1":
              await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });
              await conn.sendMessage(senderID, {
                video: { url: low },
                caption: "📥 *Downloaded in SD Quality*"
              }, { quoted: receivedMsg });
              await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
              break;

            case "2":
              await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });
              await conn.sendMessage(senderID, {
                video: { url: high },
                caption: "📥 *Downloaded in HD Quality*"
              }, { quoted: receivedMsg });
              await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
              break;

            case "3":
              await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });
              await conn.sendMessage(senderID, {
                audio: { url: low || high },
                mimetype: "audio/mp4",
                ptt: false
              }, { quoted: receivedMsg });
              await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
              break;

            default:
              reply("❌ Invalid option! Please reply with 1, 2, or 3.");
          }
        } catch (err) {
          console.error("Error sending media:", err);
          reply("⚠️ Failed to send file. Please try again.");
        }
      }
    });

  } catch (error) {
    console.error("Facebook Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});


// ─────────────────────────────────────────────
// 🌀 FACEBOOK DOWNLOADER (API 2 - LANCE API)
// ─────────────────────────────────────────────
cmd({
  pattern: "fb2",
  alias: ["facebook2", "fbdowonload2", "fbvideo2"], 
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Facebook video URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const response = await axios.get(`https://lance-frank-asta.onrender.com/api/downloader?url=${q}`);
    const res = response.data;

    if (!res || !res.content || !res.content.status) {
      return reply("⚠️ Failed to retrieve video. Please check the link and try again.");
    }

    const content = res.content;
    const resultArray = content.data?.result || [];

    if (!resultArray.length) {
      return reply("❌ No downloadable media found.");
    }

    const hdVideo = resultArray.find(v => v.quality?.toUpperCase() === "HD")?.url;
    const sdVideo = resultArray.find(v => v.quality?.toUpperCase() === "SD")?.url;

    // 🖼️ Auto thumbnail + fallback
    const thumbnail = content.data?.thumbnail 
                   || content.data?.thumb 
                   || content.data?.image 
                   || "https://files.catbox.moe/36ndl3.jpg";

    const caption = `
🎥 *RANUMITHA-X-MD FACEBOOK DOWNLOADER* 🎥

🔗 *Link:* ${q}

🔢 *Reply Below Number*

1️⃣ SD Quality🪫
2️⃣ HD Quality🔋
3️⃣ Audio typ 🎶

> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption,
      contextInfo: {
        externalAdReply: {
          title: "Facebook Video",
          body: "Click below to open on Facebook",
          thumbnailUrl: thumbnail,
          mediaType: 1,
          sourceUrl: q
        }
      }
    }, { quoted: fakevCard });

    const messageID = sentMsg.key.id;

    // 🧠 Reply listener
    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        const text = receivedText.trim();
        await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

        try {
          switch (text) {
            case "1":
              if (!sdVideo) return reply("❌ SD video not available.");
              await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });
              await conn.sendMessage(senderID, {
                video: { url: sdVideo },
                caption: "📥 *Downloaded in SD Quality*"
              }, { quoted: receivedMsg });
              await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
              break;

            case "2":
              if (!hdVideo) return reply("❌ HD video not available.");
              await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });
              await conn.sendMessage(senderID, {
                video: { url: hdVideo },
                caption: "📥 *Downloaded in HD Quality*"
              }, { quoted: receivedMsg });
              await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
              break;

            case "3":
              await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });
              await conn.sendMessage(senderID, {
                audio: { url: sdVideo || hdVideo },
                mimetype: "audio/mp4",
                ptt: false
              }, { quoted: receivedMsg });
              await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
              break;

            default:
              reply("*❌ Invalid option!*");
          }
        } catch (err) {
          console.error("Send media error:", err);
          reply("⚠️ Failed to send file. Please try again.");
        }
      }
    });

  } catch (error) {
    console.error("Downloader Plugin Error:", error);
    reply("❌ An error occurred while processing your request. Please try again later.");
  }
});
