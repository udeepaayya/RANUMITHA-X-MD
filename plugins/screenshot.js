const axios = require("axios");
const { cmd } = require("../command");
const { sleep } = require('../lib/functions');

// Fake vCard
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
  pattern: "screenshot",
  react: "📸",
  alias: ["ss", "ssweb"],
  desc: "Capture a full-page screenshot of a website.",
  category: "utility",
  use: ".screenshot <url>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const url = args[0];
    if (!url) return reply("❌ Please provide a URL\nExample: .screenshot https://google.com");
    if (!url.startsWith("http")) return reply("❌ URL must start with http:// or https://");

    // Send simple processing message
    await reply("🔄 Capturing screenshot... Please wait!");

    // Send screenshot directly
    await conn.sendMessage(from, {
      image: { url: `https://image.thum.io/get/fullpage/${url}` },
      caption: "- 🖼️ *Screenshot Generated Successfully!*\n\n" +
               "> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛"
    }, { quoted: fakevCard });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ Failed to capture screenshot\n✦ Please try again later.");
  }
});
