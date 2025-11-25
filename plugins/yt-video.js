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

cmd({
    pattern: "video",
    react: "🎬",
    desc: "Download YouTube MP4 by link or name reply",
    category: "download",
    use: ".video (reply to link or text)",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        // Get text from replied message
        let text = q;
        if (!text && m.quoted) {
            text = m.quoted?.message?.conversation || m.quoted?.message?.extendedTextMessage?.text;
        }
        if (!text) return reply("*Please provide a YouTube link or a name by replying!*");

        let videoData;

        // Check if the text is a YouTube link
        if (text.includes("youtube.com") || text.includes("youtu.be")) {
            videoData = {
                title: "YouTube Video",
                url: text,
                thumbnail: `https://i.ytimg.com/vi/${text.split("v=")[1] || text.split("/").pop()}/hqdefault.jpg`,
                timestamp: "Unknown",
                ago: "Unknown",
                views: "Unknown"
            };
        } else {
            // Search YouTube by name
            const search = await yts(text);
            if (!search.videos.length) return reply("*❌ No results found for this name.*");
            videoData = search.videos[0];
        }

        const ytUrl = videoData.url;

        // API download links
        const formats = {
            "240p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=240&apikey=YOU_API_KEY`,
            "360p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=360&apikey=YOU_API_KEY`,
            "480p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=480&apikey=YOU_API_KEY`,
            "720p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=720&apikey=YOU_API_KEY`
        };

        const caption = `
*📽️ RANUMITHA-X-MD VIDEO DOWNLOADER 🎥*

*🎵 Title:* ${videoData.title}
*⏱️ Duration:* ${videoData.timestamp}
*📆 Uploaded:* ${videoData.ago}
*📊 Views:* ${videoData.views}
*🔗 Link:* ${videoData.url}

🔢 *Reply Below Number*

1. *Video FILE 📽️*
   1.1 240p 📽️
   1.2 360p 📽️
   1.3 480p 📽️
   1.4 720p 📽️

2. *Document FILE 📂*
   2.1 240p 📂
   2.2 360p 📂
   2.3 480p 📂
   2.4 720p 📂

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        // Send thumbnail + caption
        const sentMsg = await conn.sendMessage(from, {
            image: { url: videoData.thumbnail },
            caption
        }, { quoted: fakevCard });

        const messageID = sentMsg.key.id;

        // Listen for user reply selection
        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText =
                receivedMsg.message.conversation ||
                receivedMsg.message.extendedTextMessage?.text;

            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot =
                receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot) {
                let selectedFormat, isDocument = false;

                switch (receivedText.trim().toUpperCase()) {
                    case "1.1": selectedFormat = "240p"; break;
                    case "1.2": selectedFormat = "360p"; break;
                    case "1.3": selectedFormat = "480p"; break;
                    case "1.4": selectedFormat = "720p"; break;

                    case "2.1": selectedFormat = "240p"; isDocument = true; break;
                    case "2.2": selectedFormat = "360p"; isDocument = true; break;
                    case "2.3": selectedFormat = "480p"; isDocument = true; break;
                    case "2.4": selectedFormat = "720p"; isDocument = true; break;

                    default:
                        return reply("*❌ Invalid option!*");
                }

                // React ⬇️ when download starts
                await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

                // Call API to get download link
                const { data: apiRes } = await axios.get(formats[selectedFormat]);

                if (!apiRes?.status || !apiRes.result?.download) {
                    await conn.sendMessage(senderID, { react: { text: '❌', key: receivedMsg.key } });
                    return reply(`❌ Unable to download the ${selectedFormat} version. Try another one!`);
                }

                const result = apiRes.result;

                // React ⬆️ before uploading
                await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });

                // Send video or document
                if (isDocument) {
                    await conn.sendMessage(senderID, {
                        document: { url: result.download },
                        mimetype: "video/mp4",
                        fileName: `${videoData.title}.mp4`
                    }, { quoted: receivedMsg });
                } else {
                    await conn.sendMessage(senderID, {
                        video: { url: result.download },
                        mimetype: "video/mp4",
                        ptt: false,
                    }, { quoted: receivedMsg });
                }

                // React ✅ after upload complete
                await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
            }
        });

    } catch (error) {
        console.error("Video Command Error:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});
