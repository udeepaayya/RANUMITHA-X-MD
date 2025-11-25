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

async(conn, mek, m,{from, l, quoted, body, isCmd, args, q, reply}) => {
try{

    // ----------------------------
    //  SEARCH QUERY HANDLING
    // ----------------------------
    let query = q; // normal input

    if (!query && quoted) {
        // Simple text message
        if (quoted.message.conversation) {
            query = quoted.message.conversation;
        }
        // Extended text message (caption / extended)
        else if (quoted.message.extendedTextMessage && quoted.message.extendedTextMessage.text) {
            query = quoted.message.extendedTextMessage.text;
        }
    }

    if (!query) return reply("⚠️ Please provide a song name (or reply to a message).");

    // SEARCH
    let arama;
    try {
        arama = await ytdl(query);
    } catch(e) {
        l(e)
        return await conn.sendMessage(from , { text: '*Error !!*' }, { quoted: fakevCard } )
    }

    // BUILD MESSAGE
    let mesaj = '';
    arama.all.map(video => {
        mesaj += `> *🔥 ${video.title}*\n🔗 ${video.url}\n\n`;
    });

    // SEND RESULT
    await conn.sendMessage(from , { text: mesaj }, { quoted: fakevCard });

} catch (e) {
    l(e)
    reply('*Error !!*')
}
});
