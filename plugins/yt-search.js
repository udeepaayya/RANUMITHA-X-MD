const config = require('../config')
const l = console.log
const { cmd } = require('../command')
const yts = require('yt-search')
const axios = require("axios")
const fs = require("fs-extra")

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

// Temporary store
let YTS_RESULTS = {} 

cmd({
    pattern: "yts",
    alias: ["ytsearch"],
    use: ".yts query or reply text",
    react: "🔎",
    desc: "YouTube search with thumbnail + reply system",
    category: "search",
    filename: __filename
},

async (conn, mek, m, { from, reply, q, quoted }) => {
    try {

        // If user replied to a message
        let searchText = q ? q : quoted?.msg?.conversation

        if (!searchText)
            return reply("*Please type a name or reply to text!*")

        // Search YouTube
        let res = await yts(searchText);
        if (!res || !res.all.length)
            return reply("*No results found!*")

        let videos = res.all.slice(0, 8) // only first 8 results
        YTS_RESULTS[from] = videos

        // Send thumbnail + list
        let thumb = await axios.get(videos[0].thumbnail, { responseType: "arraybuffer" })

        let caption = `*🔍 YouTube Search Results*\n\n*Query:* ${searchText}\n\n`

        videos.map((v, i) => {
            caption += `*${i + 1}. ${v.title}*\n🔗 ${v.url}\n\n`
        })

        await conn.sendMessage(from, {
            image: Buffer.from(thumb.data),
            caption
        }, { quoted: fakevCard })

        reply("*Reply a number to download (1-8)*")

    } catch (e) {
        l(e)
        reply("*Error occurred!*")
    }
});


// Listener for reply-number → download
cmd({
    on: "text"
}, async (conn, mek, m, { from, body, quoted }) => {
    try {
        if (!YTS_RESULTS[from]) return;

        if (!quoted) return; // must reply
        if (!quoted.key || !quoted.message?.imageMessage) return;

        let n = Number(body.trim())
        if (isNaN(n) || n < 1 || n > YTS_RESULTS[from].length)
            return;

        let video = YTS_RESULTS[from][n - 1]

        await conn.sendMessage(from, { react: { text: "⬆️", key: mek.key } })

        // Download via API (bochilteam)
        let api = `https://api.damercatu.com/ytdl?url=${encodeURIComponent(video.url)}`
        let d = await axios.get(api).catch(() => null)

        if (!d || !d.data || !d.data.video)
            return reply("*Download failed!*")

        let fileUrl = d.data.video

        let buffer = await axios.get(fileUrl, { responseType: "arraybuffer" })

        await conn.sendMessage(from, {
            video: Buffer.from(buffer.data),
            caption: `*🎬 ${video.title}*\nDownloaded Successfully!`
        }, { quoted: fakevCard })

        await conn.sendMessage(from, { react: { text: "⬇️", key: mek.key } })

        delete YTS_RESULTS[from]

    } catch (e) {
        l(e)
    }
});
