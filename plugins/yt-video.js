const axios = require('axios');
const yts = require('yt-search');
const { cmd } = require('../command');

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

// Function to convert Shorts URL to normal watch URL
function convertShortsToWatch(url) {
    if (url.includes("youtube.com/shorts/")) {
        const videoId = url.split("/shorts/")[1].split(/[?#&]/)[0];
        return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return url;
}

cmd({
    pattern: "video",
    react: "🎬",
    desc: "Download YouTube MP4 (Supports Shorts)",
    category: "download",
    use: ".video <query or link>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("*Please give me text or link❓*");

        let search;
        if (q.match(/(?:youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/watch\?v=)/)) {
            // Direct link
            search = { videos: [{ url: q }] };
        } else {
            // Search by text
            search = await yts(q);
            if (!search.videos.length) return reply("*❌ No results found.*");
        }

        const data = search.videos[0];
        const ytUrl = convertShortsToWatch(data.url);

        // API links for multiple qualities
        const formats = {
            "240p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=240&apikey=YOU_API_KEY`,
            "360p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=360&apikey=YOU_API_KEY`,
            "480p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=480&apikey=YOU_API_KEY`,
            "720p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=720&apikey=YOU_API_KEY`
        };

        const caption = `
*📽️ RANUMITHA-X-MD VIDEO DOWONLOADER 🎥*

*🎵 \`Title:\`* ${data.title || "Short Video"}
*⏱️ \`Duration:\`* ${data.timestamp || "Unknown"}
*📆 \`Uploaded:\`* ${data.ago || "Unknown"}
*📊 \`Views:\`* ${data.views || "Unknown"}
*🔗 \`Link:\`* ${ytUrl}

🔢 *Reply Below Number*

1. *Video FILE 📽️*
   1.1 240p Qulity 📽
