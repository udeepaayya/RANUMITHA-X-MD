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


cmd({
  pattern: "fb",
  alias: ["facebook", "fbvideo", "facebookvideo"], 
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "🚩 Please give a valid Facebook URL 🐼" }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '🎥', key: m.key } });

    // ✅ Fetch data from API
    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/fbdl?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.status || !data?.data) {
      return reply("⚠️ Failed to retrieve Facebook media. Please check the link and try again.");
    }

    const { title, low, high } = data.data;

    // 🎨 Fixed custom thumbnail
    const fixedThumbnail = "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/RANUMITHA-X-MD_FB.jpg";

    // 🖼️ Caption content
    const caption = `
🎥 *RANUMITHA-X-MD FACEBOOK DOWNLOADER* 🎥

📑 *Title:* ${title || "No title"}
🔗 *Link:* ${q}

💬 *Reply with your choice:*

 1️⃣ HD Quality🔋
 2️⃣ SD Quality🪫
 3️⃣ Audio Type 🎶

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    // 🧩 Send custom thumbnail image with caption
    const sentMsg = await conn.sendMessage(from, {
      image: { url: fixedThumbnail },
      caption: caption
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
        // ⬇️ React when download begins
        await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

        // 🧩 Download the custom thumbnail as buffer
        const thumbBuffer = await (await axios.get(fixedThumbnail, { responseType: 'arraybuffer' })).data;

        let mediaMsg;

        switch (receivedText.trim()) {
         
                    case "1":
            await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });

            mediaMsg = await conn.sendMessage(senderID, {
              video: { url: high },
              mimetype: "video/mp4",
              caption: "*HD Quality Video* 🔋",
              thumbnail: thumbBuffer
            }, { quoted: receivedMsg });

            await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
            break;
            
            case "2":
            // ⬆️ React for upload
            await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });

            mediaMsg = await conn.sendMessage(senderID, {
              video: { url: low },
              mimetype: "video/mp4",
              caption: "*SD Quality Video* 🪫",
              thumbnail: thumbBuffer
            }, { quoted: receivedMsg });

            // ✅ React after sent
            await conn.sendMessage(senderID, { react: { text: '✔️', key: receivedMsg.key } });
            break;

          case "3":
            await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });

            mediaMsg = await conn.sendMessage(senderID, { 
              audio: { url: low || high }, 
              mimetype: "audio/mp4", 
              ptt: false 
            }, { quoted: receivedMsg });

            await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
            break;

          default:
            reply("*❌ Invalid option!*");
        }
      }
    });

  } catch (error) {
    console.error("*FB Plugin Error*:", error);
    reply("*Error downloading or sending video.*");
  }
});
