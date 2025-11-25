const config = require('../config')
const l = console.log
const { cmd } = require('../command')
const yts = require('yt-search')
const { getBuffer } = require('../lib/functions')

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
    use: '.yts <text> or reply to message',
    react: "🔎",
    desc: "Search and get details from YouTube.",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, reply, q, quoted }) => {
    try {
        // Determine search query
        let query = q || (quoted && quoted.text) || (quoted && quoted.caption);
        if (!query) return reply('*Please give me words to search or reply to a message!*');

        // Search YouTube
        let results = await yts(query);
        if (!results || !results.all || results.all.length === 0) return reply('*No results found!*');

        // Build message
        let mesaj = '';
        results.all.slice(0, 10).forEach((video, i) => {
            mesaj += `> *${i + 1}. ${video.title}*\n🔗 ${video.url}\n\n`;
        });

        // Image for YTS
        let imageUrl = "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/RANUMITHA-X-MD%20YTS.jpg";
        let buffer = await getBuffer(imageUrl);

        // Send response
        await conn.sendMessage(from, {
            image: buffer,
            caption: mesaj
        }, { quoted: fakevCard });

    } catch (e) {
        l(e);
        reply('*Error occurred while searching!*');
    }
});
