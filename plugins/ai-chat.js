const { cmd } = require('../command');
const axios = require('axios');

cmd({
  pattern: "ai",
  alias: ["bot", "ranumithaai", "gpt", "gpt4", "bing", "ranuai"],
  desc: "Chat with an AI model",
  category: "ai",
  react: "🤖",
  filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
  try {
    if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

    const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data || !data.message) {
      await react("❌");
      return reply("AI failed to respond. Please try again later.");
    }

    // ----------------------------------------
    // SAFE PROFILE PICTURE FETCH (NO CRASH)
    // ----------------------------------------
    let thumb = Buffer.from([]);
    const number = "18002428478";
    const jid = number + "@s.whatsapp.net";

    try {
      const ppUrl = await conn.profilePictureUrl(jid, "image")
        .catch(() => null);   // Prevent crash

      if (ppUrl) {
        const ppResp = await axios.get(ppUrl, { responseType: "arraybuffer" })
          .catch(() => null); // Prevent crash

        if (ppResp && ppResp.data) {
          thumb = Buffer.from(ppResp.data, "binary");
        }
      }

    } catch (err) {
      console.log("Profile picture fetch failed (safe handled)");
    }

    // ----------------------------------------

    // Create safe contact card
    const contactCard = {
      key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
      },
      message: {
        contactMessage: {
          displayName: "GPT 3✅",
          vcard: `BEGIN:VCARD
VERSION:3.0
FN: GPT 3
ORG: OpenAI
TEL;type=CELL;type=VOICE;waid=${number}:+1 800 242 8478
END:VCARD`,
          jpegThumbnail: thumb
        }
      }
    };

    // Send AI Response
    await conn.sendMessage(from, {
      text: `🤖 *RANUMITHA-X-MD Ai Response:*\n\n${data.message}`
    }, { quoted: contactCard });

    await react("✅");

  } catch (e) {
    console.error("Error in AI command:", e);
    await react("❌");
    return reply("An error occurred while communicating with the AI.");
  }
});
