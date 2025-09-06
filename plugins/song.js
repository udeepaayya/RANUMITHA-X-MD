const { cmd } = require("../command");
const fetch = require("node-fetch");

// Fake vCard (status sender)
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
  pattern: "song",
  alias: ["play", "mp3"],
  react: "🎶",
  desc: "Download YouTube song (Audio) via izumiii API",
  category: "download",
  use: ".song ",
  filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
  try {
    if (!q) return reply("⚠️ Please provide a song name or YouTube link.");

    const apiUrl = `https://izumiiiiiiii.dpdns.org/downloader/play?query=${encodeURIComponent(q)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data?.status || !data?.result?.downloads) {
      return reply("❌ Song not found or API error. Try again later.");
    }

    const meta = data.result.metadata;
    const downloadUrl = data.result.downloads;

    // Fetch thumbnail
    let buffer;
    try {
      const thumbRes = await fetch(meta.thumbnail || meta.image);
      buffer = Buffer.from(await thumbRes.arrayBuffer());
    } catch {
      buffer = null;
    }

    // Styled caption
    const caption = `🎶 *RANUMITHA-X-MD SONG DOWNLOADER* 🎶
🎵 *Title:* ${meta.title}
👤 *Artist:* ${meta?.author?.name || "Unknown"}
⏱ *Duration:* ${meta?.timestamp || "N/A"}
👁 *Views:* ${meta?.views?.toLocaleString() || "N/A"}
🔗 *Url:* ${meta.url}

🔽 *Reply with your choice:*

1. *Audio Type* 🎵
2. *Document Type* 📁
3. *Voice Note Type* 🎤

> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    // Send image + caption
    const sentMsg = await conn.sendMessage(from, {
      image: buffer,
      caption: caption
    }, { quoted: fakevCard });

    const messageID = sentMsg.key.id;

    // Listen for reply
    conn.ev.on("messages.upsert", async (msgUpdate) => {
      try {
        const mekInfo = msgUpdate?.messages[0];
        if (!mekInfo?.message) return;

        const userText = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
        const isReply = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;
        if (!isReply) return;

        let choice = userText.trim();
        let type;

        // ⬇️ React when user makes a choice
        await conn.sendMessage(from, { react: { text: "⬇️", key: mekInfo.key } });

        if (choice === "1") {
          type = {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${meta.title.replace(/[\/:*?"<>|]/g, "").slice(0, 80)}.mp3`
          };
        } else if (choice === "2") {
          type = {
            document: { url: downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${meta.title.replace(/[\/:*?"<>|]/g, "").slice(0, 80)}.mp3`,
            caption: meta.title
          };
        } else if (choice === "3") {
          type = {
            audio: { url: downloadUrl },
            mimetype: "audio/mpeg",
            ptt: true
          };
        } else {
          return reply("❌ Invalid choice! Reply with 1, 2 or 3.");
        }

        // ⬆️ React while uploading
        await conn.sendMessage(from, { react: { text: "⬆️", key: mekInfo.key } });

        // Send the actual media
        await conn.sendMessage(from, type, { quoted: mek });

        // ✅ React after successful upload
        await conn.sendMessage(from, { react: { text: "✅", key: mekInfo.key } });

      } catch (err) {
        console.error("reply handler error:", err);
        reply("⚠️ Error while processing your choice.");
      }
    });

  } catch (err) {
    console.error("song cmd error:", err);
    reply("⚠️ An error occurred while processing your request.");
  }
});
