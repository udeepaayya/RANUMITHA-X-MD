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

    // Extract file ID
    const fileId = q.match(/[-\w]{25,}/)?.[0];
    if (!fileId) return reply("⚠️ Invalid Google Drive link!");

    const initialURL = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // STEP 1 – get confirmation token + cookies
    const step1 = await axios.get(initialURL, {
      maxRedirects: 0,
      validateStatus: s => s === 200 || s === 302
    });

    let confirm = null;
    if (step1.data.includes("confirm=")) {
      confirm = step1.data.match(/confirm=([0-9A-Za-z-_]+)/)?.[1];
    }

    const cookies = step1.headers["set-cookie"]?.map(c => c.split(";")[0]).join("; ") || "";

    // Build final download URL
    const finalURL = confirm
      ? `https://drive.google.com/uc?export=download&confirm=${confirm}&id=${fileId}`
      : initialURL;

    // STEP 2 – download original file
    const step2 = await axios.get(finalURL, {
      responseType: "arraybuffer",
      headers: { Cookie: cookies }
    });

    // Extract filename
    const disposition = step2.headers["content-disposition"] || "";
    const matchName = disposition.match(/filename="(.+?)"/);
    const fileName = matchName ? matchName[1] : `drive_${fileId}`;

    const mimeType = step2.headers["content-type"] || "application/octet-stream";
    const tempPath = path.join(__dirname, fileName);

    fs.writeFileSync(tempPath, step2.data);

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(
      from,
      {
        document: fs.readFileSync(tempPath),
        mimetype: mimeType,
        fileName: fileName,
        caption: "> *Original Google Drive File ✓*\n> *© RANUMITHA-X-MD*"
      },
      { quoted: m }
    );

    fs.unlinkSync(tempPath);
    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.log("GDRIVE ERROR:", error?.response?.status || error);
    reply("❌ Could not download. File may be: \n- Private\n- Limited access\n- Not shared publicly\n- Google flagged\n\nTry another link.");
  }
});
