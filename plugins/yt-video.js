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
TEL;type=CELL;type=VOICE;waid=13135550002:+13135550002
END:VCARD`
        }
    }
};

cmd({
    pattern: "video",
    react: "🎬",
    desc: "Download YouTube MP4",
    category: "download",
    use: ".video <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("*Please give me text or link❓*");

        const search = await yts(q);
        if (!search.videos.length) return reply("*❌ No results found.*");

        const data = search.videos[0];
        const ytUrl = data.url;

        // Define API links for multiple qualities
        const formats = {
            "240p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=240&apikey=YOU_API_KEY`,
            "360p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=360&apikey=YOU_API_KEY`,
            "480p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=480&apikey=YOU_API_KEY`,
            "720p": `https://sadiya-tech-apis.vercel.app/download/ytdl?url=${encodeURIComponent(ytUrl)}&format=720&apikey=YOU_API_KEY`
        };

        const caption = `
*📽️ RANUMITHA-X-MD VIDEO DOWONLOADER 🎥*

*🎵 \`Title:\`* ${data.title}
*⏱️ \`Duration:\`* ${data.timestamp}
*📆 \`Uploaded:\`* ${data.ago}
*📊 \`Views:\`* ${data.views}
*🔗 \`Link:\`* ${data.url}

🔢 *Reply Below Number*

1. *Video FILE 📽️*

   1.1 240p Qulity 📽️
   1.2 360p Qulity 📽️
   1.3 480p Qulity 📽️
   1.4 720p Qulity 📽️

2. *Document FILE 📂*
 
   2.1 240p Qulity 📂
   2.2 360p Qulity 📂
   2.3 480p Qulity 📂
   2.4 720p Qulity 📂

> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption
        }, { quoted: fakevCard });

        const messageID = sentMsg.key.id;

        // Listen for user replies
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

                const { data: apiRes } = await axios.get(formats[selectedFormat]);

                if (!apiRes?.status || !apiRes.result?.download) {
                    await conn.sendMessage(senderID, { react: { text: '❌', key: receivedMsg.key } });
                    return reply(`❌ Unable to download the ${selectedFormat} version. Try another one!`);
                }

                const result = apiRes.result;

                // React ⬆️ before uploading
                await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });

                if (isDocument) {
                    await conn.sendMessage(senderID, {
                        document: { url: result.download },
                        mimetype: "video/mp4",
                        fileName: `${data.title}.mp4`
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
