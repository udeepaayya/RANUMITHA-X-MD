const config = require('../config')
const l = console.log
const { cmd, commands } = require('../command')
const dl = require('@bochilteam/scraper')  
const ytdl = require('yt-search')
const fs = require('fs-extra')

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
    use: '.yts song name',
    react: "🔎",
    desc: "Search and get details from youtube.",
    category: "search",
    filename: __filename
},

async (conn, mek, m, { from, reply, q }) => {
    try {

        // -----------------------------
        // 📌 AUTO QUERY SYSTEM
        // -----------------------------
        let query = q?.trim();

        // If no query & user replied to something → use that text
        if (!query && m?.quoted) {
            query =
                m.quoted.message?.conversation ||
                m.quoted.message?.extendedTextMessage?.text ||
                m.quoted.text;
        }

        if (!query) {
            return reply("⚠️ Please provide a search term (or reply to a message).");
        }

        // -----------------------------
        // 🔍 SEARCH SECTION
        // -----------------------------
        let search;
        try {
            search = await ytdl(query);
        } catch (err) {
            l(err);
            return await conn.sendMessage(
                from,
                { text: "*❌ Error searching YouTube!*" },
                { quoted: fakevCard }
            );
        }

        let msg = '';
        search.all.map(video => {
            msg += `> *🔥 ${video.title}*\n🔗 ${video.url}\n\n`;
        });

        await conn.sendMessage(
            from,
            { text: msg || "❌ No results found!" },
            { quoted: fakevCard }
        );

    } catch (e) {
        l(e);
        reply("*❌ Error !!*");
    }
});
