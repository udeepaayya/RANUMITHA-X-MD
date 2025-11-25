const config = require('../config')
const l = console.log
const { cmd, commands } = require('../command')
const dl = require('@bochilteam/scraper')  
const ytdl = require('yt-search');
const fs = require('fs-extra')
var videotime = 60000 // 1000 min
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson} = require('../lib/functions')

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
  pattern: "yts",
  alias: ["ytsearch"],
  use: '.yts ranumitha',
  react: "🔎",
  desc: "Search and get details from youtube.",
  category: "search",
  filename: __filename
},

async (conn, mek, m, { from, q, reply }) => {

  try {

    if (!q) return reply('*Please give me words to search*');

    let yts = require("yt-search")
    let arama = await yts(q);

    var mesaj = '';
    arama.all.map((video) => {
      mesaj += '> *🔥 ' + video.title + '*\n'
      mesaj += '🔗 ' + video.url + '\n\n'
    })

    // --- IMAGE + TEXT MESSAGE ---
    await conn.sendMessage(
      from,
      {
        image: { url: "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/RANUMITHA-X-MD%20YTS.jpg" },
        caption: mesaj
      },
      { quoted: fakevCard }
    );

  } catch (e) {
    l(e)
    reply('*Error !!*')
  }
});
