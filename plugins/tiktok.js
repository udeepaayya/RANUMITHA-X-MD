const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video with options",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("❗ Please provide a TikTok video link.");
        if (!q.includes("tiktok.com")) return reply("❌ Invalid TikTok link.");

        await reply("⬇️ Fetching TikTok data, please wait...");

        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) return reply("❌ Failed to fetch TikTok video.");

        const { title, like, comment, share, author, meta, music } = data.data;

        // Extract media safely
        const videoHQ = meta.media.find(v => v.quality === "hd")?.org || meta.media[0]?.org;
        const videoNormal = meta.media.find(v => v.quality === "sd")?.org || meta.media[0]?.org;
        const videoWatermarked = meta.media.find(v => v.watermark)?.org || meta.media[0]?.org;
        const audioUrl = music?.play_url || meta.audio?.url;

        const caption = `🎵 *TikTok Downloader* 🎵\n\n` +
                        `👤 *User:* ${author.nickname} (@${author.username})\n` +
                        `📖 *Title:* ${title}\n` +
                        `👍 *Likes:* ${like}\n💬 *Comments:* ${comment}\n🔁 *Shares:* ${share}\n\n` +
                        `⬇️ *Select what you want to download:*\n\n` +
                        `1️⃣ Standard Quality\n` +
                        `2️⃣ Watermarked Version\n` +
                        `3️⃣ High Quality Video\n` +
                        `4️⃣ MP3 Audio`;

        await conn.sendMessage(from, { text: caption }, { quoted: mek });

        // Wait for user reply (using event listener)
        const messageHandler = async (msgUpdate) => {
            try {
                const msg = msgUpdate.messages[0];
                if (!msg.message || msg.key.fromMe) return;

                const userReply = msg.message.conversation?.trim();
                const sender = msg.key.remoteJid;

                // Only respond to the same user who requested
                if (sender !== from) return;

                if (!["1", "2", "3", "4"].includes(userReply)) return;

                let downloadUrl, fileType;
                if (userReply === "1") {
                    downloadUrl = videoNormal;
                    fileType = "video";
                } else if (userReply === "2") {
                    downloadUrl = videoWatermarked;
                    fileType = "video";
                } else if (userReply === "3") {
                    downloadUrl = videoHQ;
                    fileType = "video";
                } else if (userReply === "4") {
                    downloadUrl = audioUrl;
                    fileType = "audio";
                }

                await reply("⬆️ Uploading your file, please wait...");

                await conn.sendMessage(from, {
                    [fileType]: { url: downloadUrl },
                    caption: `✅ *Download Complete!*\n🎧 ${title}`
                }, { quoted: mek });

                await conn.sendMessage(from, { react: { text: "✅", key: msg.key } });

                // Remove listener after successful reply
                conn.ev.off('messages.upsert', messageHandler);

            } catch (err) {
                console.error("Message Handler Error:", err);
            }
        };

        conn.ev.on('messages.upsert', messageHandler);

    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});
