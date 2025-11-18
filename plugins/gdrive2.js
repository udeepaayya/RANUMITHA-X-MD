const { cmd } = require("../command");
const axios = require("axios");

function extractDriveId(url) {
  const regex = /\/d\/(.*?)\//;
  const match = url.match(regex);
  return match ? match[1] : null;
}

cmd({
  pattern: "gdrive2",
  desc: "Download Google Drive files.",
  react: "🌐",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a valid Google Drive link.");

    const fileId = extractDriveId(q);
    if (!fileId) return reply("⚠️ Invalid Google Drive link!");

    await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });

    // Direct Download Generator
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // File Info API (Public)
    const infoApi = `https://gdlp-server.vercel.app/info?id=${fileId}`;
    const info = await axios.get(infoApi).then(r => r.data).catch(() => null);

    let fileName = info?.fileName || `gdrive_file_${fileId}`;
    let mimeType = info?.mimeType || "application/octet-stream";

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(
      from,
      {
        document: { url: downloadUrl },
        mimetype: mimeType,
        fileName: fileName,
        caption: "> *© Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛*"
      },
      { quoted: m }
    );

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.log(e);
    reply("❌ Error downloading Google Drive file. Check the link and try again.");
  }
});
