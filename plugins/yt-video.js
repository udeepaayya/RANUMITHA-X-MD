const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
  pattern: "video",
  react: "🎬",
  desc: "Download YouTube MP4 (WhatsApp compatible)",
  category: "download",
  use: ".video3 <query>",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("❓ What video do you want to download?");

    const search = await yts(q);
    if (!search.videos.length) return reply("❌ No results found for your query.");

    const data = search.videos[0];
    const ytUrl = data.url;

    // ✅ Use a better API (returns real mp4 link)
    const api = `https://api.akuari.my.id/downloader/youtube?link=${encodeURIComponent(ytUrl)}`;
    const { data: apiRes } = await axios.get(api);

    if (!apiRes?.status || !apiRes.mp4) return reply("❌ Failed to get video link. Try again later.");

    const videoUrl = apiRes.mp4;
    const caption = `
📑 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📆 *Uploaded:* ${data.ago}
📊 *Views:* ${data.views}
🔗 *Link:* ${data.url}

🔢 *Reply Below Number*

1️⃣ *Video Type*
2️⃣ *Document Type*

> Powered by DARK-KNIGHT-XMD`;

    const sentMsg = await conn.sendMessage(from, {
      image: { url: data.thumbnail },
      caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg?.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (!isReplyToBot) return;

      await conn.sendMessage(senderID, { react: { text: '⏳', key: receivedMsg.key } });

      // ✅ Download file locally to ensure correct format
      const tempFile = path.join(__dirname, "../temp", `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempFile);

      const videoStream = await axios({
        url: videoUrl,
        method: 'GET',
        responseType: 'stream'
      });

      videoStream.data.pipe(writer);

      writer.on('finish', async () => {
        if (receivedText.trim() === "1") {
          await conn.sendMessage(senderID, {
            video: fs.readFileSync(tempFile),
            mimetype: "video/mp4",
            caption: data.title
          }, { quoted: receivedMsg });
        } else if (receivedText.trim() === "2") {
          await conn.sendMessage(senderID, {
            document: fs.readFileSync(tempFile),
            mimetype: "video/mp4",
            fileName: `${data.title}.mp4`
          }, { quoted: receivedMsg });
        } else {
          reply("❌ Invalid option! Please reply with 1 or 2.");
        }

        fs.unlinkSync(tempFile);
      });
    });

  } catch (error) {
    console.error("Video Command Error:", error);
    reply("❌ Error occurred while downloading. Try again later.");
  }
});
