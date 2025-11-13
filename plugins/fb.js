const axios = require("axios");
const { cmd } = require('../command');

cmd({
  pattern: "fb",
  alias: ["facebook", "fbvideo", "facebookvideo"], 
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Facebook video URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '🎥', key: m.key } });

    // ✅ Fetch data from API
    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.status || !data?.data) {
      return reply("⚠️ Failed to retrieve Facebook media. Please check the link and try again.");
    }

    const { title, thumbnail, low, high } = data.data;

    // 🖼️ Download thumbnail and resend as video preview
    const caption = `
🎥 *RANUMITHA-X-MD FACEBOOK DOWNLOADER* 🎥

📑 *Title:* ${title || "No title"}
🔗 *Link:* ${q}

💬 *Reply with your choice:*

 1️⃣ SD Quality🪫
 2️⃣ HD Quality🔋
 3️⃣ Audio Type 🎶

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    // 🧩 Send thumbnail with caption
    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    // 🧠 Reply listener
    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

        switch (receivedText.trim()) {
          case "1":
            await conn.sendMessage(senderID, {
              video: { url: low },
              mimetype: "video/mp4",
              caption: "*SD Quality Video* 🪫",
              thumbnail: await (await axios.get(thumbnail, { responseType: 'arraybuffer' })).data
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: high },
              mimetype: "video/mp4",
              caption: "*HD Quality Video* 🔋",
              thumbnail: await (await axios.get(thumbnail, { responseType: 'arraybuffer' })).data
            }, { quoted: receivedMsg });
            break;

          case "3":
            await conn.sendMessage(senderID, { 
              audio: { url: low || high }, 
              mimetype: "audio/mp4", 
              ptt: false 
            }, { quoted: receivedMsg });
            break;
            
          default:
            reply("*❌ Invalid option!*");
        }
      }
    });

  } catch (error) {
    console.error("*FB Plugin Error*:", error);
    reply("*Error*");
  }
});
