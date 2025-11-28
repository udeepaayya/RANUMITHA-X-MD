const { cmd } = require("../command");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

cmd({
  pattern: "getvideo",
  alias: ["gvideo", "video"],
  desc: "Download video from any direct link (Original quality)",
  category: "download",
  react: "🎥",
  use: ".getvideo <video-url>",
  filename: __filename,
}, async (conn, mek, m, { from, reply, q }) => {

  try {
    if (!q) return reply("*🖇️ Please send me a direct video URL!*");

    const videoUrl = q.trim();

    // React: Downloading
    await conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } });

    // Download video buffer
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error("Invalid video link");

    const buffer = Buffer.from(await videoRes.arrayBuffer());

    // Save temporary video
    const fileName = `${Date.now()}.mp4`;
    const filePath = path.join(__dirname, `../temp/${fileName}`);

    fs.writeFileSync(filePath, buffer);

    // React: Uploading
    await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } });

    // Send the video
    await conn.sendMessage(from, {
      video: fs.readFileSync(filePath),
      mimetype: "video/mp4",
      caption: "🎥 *Here is your video!*\n\n> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛",
    });

    // React: Done
    await conn.sendMessage(from, { react: { text: "✔️", key: mek.key } });

    // Clean temp file
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error(err);
    await conn.sendMessage(from, { react: { text: "🎥", key: mek.key } });
    reply("❗ *Error downloading video.* Make sure URL is direct.");
  }
});
