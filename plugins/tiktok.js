const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video (choose quality or format)",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("Please provide a TikTok video link.");
        if (!q.includes("tiktok.com")) return reply("❌ Invalid TikTok link.");

        await reply("⬇️ Fetching TikTok data, please wait...");

        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) return reply("❌ Failed to fetch TikTok video.");

        const { title, like, comment, share, author, meta, music } = data.data;

        // Extract available URLs safely
        const videoHQ = meta.media.find(v => v.quality === "hd")?.org || meta.media[0]?.org;
        const videoNormal = meta.media.find(v => v.quality === "sd")?.org || meta.media[0]?.org;
        const videoWatermarked = meta.media.find(v => v.watermark)?.org || meta.media[0]?.org;
        const audioUrl = music?.play_url || meta.audio?.url;

        const caption = `🎵 *TikTok Video Downloader* 🎵\n\n` +
                        `👤 *User:* ${author.nickname} (@${author.username})\n` +
                        `📖 *Title:* ${title}\n` +
                        `👍 *Likes:* ${like}\n💬 *Comments:* ${comment}\n🔁 *Shares:* ${share}\n\n` +
                        `⬇️ *Select what you want to download:*\n\n` +
                        `1️⃣ Standard Quality\n` +
                        `2️⃣ Watermarked Version\n` +
                        `3️⃣ High Quality Video\n` +
                        `4️⃣ MP3 Audio`;

        await conn.sendMessage(from, { text: caption }, { quoted: mek });

        // Wait for user reply
        conn.once('message', async (msg) => {
            const number = msg.message?.conversation?.trim();

            if (!["1", "2", "3", "4"].includes(number)) return reply("❌ Invalid option. Please send 1, 2, 3, or 4.");

            let downloadUrl, fileType, sendOpts = {};

            if (number === "1") {
                downloadUrl = videoNormal;
                fileType = "video";
            } else if (number === "2") {
                downloadUrl = videoWatermarked;
                fileType = "video";
            } else if (number === "3") {
                downloadUrl = videoHQ;
                fileType = "video";
            } else if (number === "4") {
                downloadUrl = audioUrl;
                fileType = "audio";
            }

            reply("⬆️ Uploading your file, please wait...");

            await conn.sendMessage(from, {
                [fileType]: { url: downloadUrl },
                caption: `✅ Successfully downloaded!\n🎧 *${title}*`
            }, { quoted: mek });

            await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });
        });

    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});
