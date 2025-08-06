const axios = require("axios");
const cheerio = require('cheerio');
const { cmd, commands } = require('../command')
const config = require('../config');
const {fetchJson} = require('../lib/functions');

const api = `https://nethu-api-ashy.vercel.app`;

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
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }
    }
};

cmd({
  pattern: "facebook",
  react: "🎥",
  alias: ["fbb", "fbvideo", "fb"],
  desc: "Download videos from Facebook",
  category: "download",
  use: '.facebook <facebook_url>',
  filename: __filename
},
async(conn, mek, m, {
    from, prefix, q, reply
}) => {
  try {
  if (!q) return reply("*🚩 Please give me a facebook url🐼*");

  const fb = await fetchJson(`${api}/download/fbdown?url=${encodeURIComponent(q)}`);
  
  if (!fb.result || (!fb.result.sd && !fb.result.hd)) {
    return reply("I couldn't find anything :(");
  }

  let caption = `𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗

📝 ᴛɪᴛʟᴇ : Facebook video
🦸‍♀️ ᴘᴏᴡᴇʀᴇᴅ ʙʏ : 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗
🔗 ᴜʀʟ : ${q}`;


  if (fb.result.thumb) {
    await conn.sendMessage(from, {
      image: { url: fb.result.thumb },
      caption : caption,
      }, { quoted: fakevCard });
  }

    if (fb.result.sd) {
      await conn.sendMessage(from, {
        video: { url: fb.result.sd },
        mimetype: "video/mp4",
        caption: `*SD-Quality*🪫`
      }, { quoted: fakevCard });
    }

if (fb.result.hd) {
      await conn.sendMessage(from, {
        video: { url: fb.result.hd },
        mimetype: "video/mp4",
        caption: `*HD-Quality*🔋`
      }, { quoted: fakevCard });
    }

} catch (err) {
  console.error(err);
  reply("*Failed to download video💔 Please try again later...* 🐼");
  }
});
