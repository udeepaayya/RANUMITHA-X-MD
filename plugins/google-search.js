const { cmd } = require('../command');
const axios = require('axios');

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
  pattern: "google",
  alias: ["gsearch","gsh"],
  desc: "Search Google via Chamod API",
  category: "search",
  react: "🔎",
  filename: __filename
},
async (conn, mek, m, { text }) => {
  try {

    if (!text) return m.reply("Please provide a search query!\nExample: .google tiktok");

    // 💬 First send the fake vCard
    await conn.sendMessage(m.chat, fakevCard, { quoted: mek });

    // API call
    const apiUrl = `https://google-search-api.chamodshadow125.workers.dev/?q=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl);

    if (res.data.status && res.data.data.length > 0) {
      let msg = `🔎 *Google Search Results*\n\n`;
      res.data.data.slice(0, 5).forEach((item, i) => {
        msg += `*${i+1}.* ${item.title}\n${item.link}\n_${item.snippet}_\n\n`;
      });

      // Send results quoted using the fake vCard
      conn.sendMessage(m.chat, { text: msg }, { quoted: fakevCard });

    } else {
      m.reply("No results found 😔");
    }

  } catch (error) {
    console.error(error);
    m.reply("Error fetching results.");
  }
});
