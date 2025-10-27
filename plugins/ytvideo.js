const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "video",
    react: "🎬",
    desc: "Download YouTube MP4",
    category: "download",
    use: ".video3 <query>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q }) => {
    try {
        if (!q) return reply("❓ What video do you want to download?");

        const search = await yts(q);
        if (!search.videos.length) return reply("❌ No results found for your query.");

        const data = search.videos[0];
        const ytUrl = data.url;

        const api = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=APIKEY&url=${encodeURIComponent(ytUrl)}`;
        const { data: apiRes } = await axios.get(api);

        if (!apiRes?.status || !apiRes.result?.media?.video_url) {
            return reply("❌ Unable to download the video. Please try another one!");
        }

        const result = apiRes.result.media;
        const videoUrl = result.video_url;

        const caption = `
📑 *Title:* ${data.title}
⏱️ *Duration:* ${data.timestamp}
📆 *Uploaded:* ${data.ago}
📊 *Views:* ${data.views}
🔗 *Link:* ${data.url}

🔢 *Reply Below Number*

1️⃣ *Video Type*
2️⃣ *Document Type*
 
> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: result.thumbnail },
            caption
        }, { quoted: m });

        const messageID = sentMsg.key.id;

        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot) {
                await conn.sendMessage(senderID, { react: { text: '⏳', key: receivedMsg.key } });

                const tempFile = path.join(__dirname, "../temp", `${Date.now()}.mp4`);
                const writer = fs.createWriteStream(tempFile);

                const videoStream = await axios({
                    url: videoUrl,
                    method: 'GET',
                    responseType: 'stream'
                });

                videoStream.data.pipe(writer);

                writer.on('finish', async () => {
                    if (receivedText.trim() === "1") {
                        await conn.sendMessage(senderID, {
                            video: fs.readFileSync(tempFile),
                            mimetype: "video/mp4",
                            caption: data.title
                        }, { quoted: receivedMsg });
                    } else if (receivedText.trim() === "2") {
                        await conn.sendMessage(senderID, {
                            document: fs.readFileSync(tempFile),
                            mimetype: "video/mp4",
                            fileName: `${data.title}.mp4`
                        }, { quoted: receivedMsg });
                    } else {
                        reply("❌ Invalid option! Please reply with 1 or 2.");
                    }

                    fs.unlinkSync(tempFile); // cleanup
                });
            }
        });

    } catch (error) {
        console.error("Video Command Error:", error);
        reply("❌ An error occurred while processing your request. Please try again later.");
    }
});
