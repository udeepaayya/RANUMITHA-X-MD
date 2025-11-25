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

async(conn, mek, m,{from, l, quoted, body, isCmd, umarmd, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
try{

// ----------------------------
//  REPLY MESSAGE HANDLING
// ----------------------------
let query;

if (quoted && quoted.text) {
    // reply karala dunnoth → reply eke text eka search wenna
    query = quoted.text;
} else {
    // normal search
    query = q;
}

if (!query) {
    return reply("⚠️ Please provide a song name (or reply to a message).");
}

// SEARCH
let arama;
try {
    let yts = require("yt-search")
    arama = await yts(query);
} catch(e) {
    l(e)
    return await conn.sendMessage(from , { text: '*Error !!*' }, { quoted: fakevCard } )
}

// MESSAGE BUILD
let mesaj = '';
arama.all.map((video) => {
mesaj += '> *🔥 ' + video.title + '*\n'
mesaj += '🔗 ' + video.url + '\n\n'
});

// SEND RESULT
await conn.sendMessage(from , { text:  mesaj }, { quoted: fakevCard } )

} catch (e) {
    l(e)
    reply('*Error !!*')
}
});
