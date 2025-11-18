const { cmd } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd({
  pattern: "gdrive2",
  desc: "Download original Google Drive files.",
  react: "🌐",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {

  try {
    if (!q) return reply("❌ Please provide a Google Drive link.");

    await conn.sendMessage(from, { react: { text: "⬇️", key: m.key } });

    const fileId = q.match(/[-\w]{25,}/)?.[0];
    if (!fileId) return reply("⚠️ Invalid Google Drive link!");

    const URL = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // STEP 1 – Get download info + confirmation token
    const res = await axios.get(URL, {
      responseType: "text",
      maxRedirects: 0,
      validateStatus: s => s === 200 || s === 302
    });

    let confirmToken = null;
    if (res.data && res.data.includes("confirm=")) {
      confirmToken = res.data.match(/confirm=([0-9A-Za-z-_]+)/)?.[1];
    }

    let finalUrl = URL;
    if (confirmToken) {
      finalUrl = `https://drive.google.com/uc?export=download&confirm=${confirmToken}&id=${fileId}`;
    }

    // STEP 2 – Download original file
    const dl = await axios.get(finalUrl, {
      responseType: "arraybuffer",
    });

    const disposition = dl.headers["content-disposition"] || "";
    const matchName = disposition.match(/filename="(.+?)"/);
    const fileName = matchName ? matchName[1] : `drive_${fileId}`;

    const mime = dl.headers["content-type"] || "application/octet-stream";

    const tempFile = path.join(__dirname, fileName);
    fs.writeFileSync(tempFile, dl.data);

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(
      from,
      {
        document: fs.readFileSync(tempFile),
        mimetype: mime,
        fileName: fileName,
        caption: "> *Original Google Drive File ✓*\n> *© Ranumitha-X-MD*"
      },
      { quoted: m }
    );

    fs.unlinkSync(tempFile);

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.log("ERROR (GDRIVE):", error);
    reply("❌ Error downloading original Google Drive file. Try again.");
  }

});
