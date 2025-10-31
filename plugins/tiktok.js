const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video in different formats",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("Please provide a TikTok video link.");
        if (!q.includes("tiktok.com")) return reply("Invalid TikTok link.");

        reply("📥 Fetching TikTok data, please wait...");

        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) return reply("❌ Failed to fetch TikTok video details.");

        const { title, like, comment, share, author, meta } = data.data;

        // Extract available formats
        const videoWithWatermark = meta.media.find(v => v.type === "video" && v.quality === "watermark")?.org;
        const videoNoWatermark = meta.media.find(v => v.type === "video" && v.quality === "hd")?.org;
        const videoOriginal = meta.media.find(v => v.type === "video" && v.quality === "original")?.org;
        const audio = meta.media.find(v => v.type === "audio")?.org;

        const menuMsg = 
`📺 *Tiktok Downloader* 📥

📑 *Title:* ${title || "N/A"}
👤 *User:* ${author.nickname} (@${author.username})
👍 *Likes:* ${like}
💬 *Comments:* ${comment}
🔁 *Shares:* ${share}

🔢 *Reply Below Number*

1️⃣  *With Watermark* 🎫
2️⃣  *No Watermark (HD)* 🎟️
3️⃣  *Original Quality* 📼
4️⃣  *Audio (MP3)* 🎶`;

        const menuMessage = await conn.sendMessage(from, {
            caption: menuMsg,
            video: { url: videoNoWatermark || videoWithWatermark },
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });

        // Listen for the user's reply
        conn.ev.on('messages.upsert', async (msgData) => {
            const msg = msgData.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;
            if (msg.message.extendedTextMessage.contextInfo?.stanzaId !== menuMessage.key.id) return;

            const userResponse = msg.message.extendedTextMessage.text.trim();

            try {
                if (userResponse === '1') {
                    if (!videoWithWatermark) return reply("❌ Watermark version not available.");
                    await conn.sendMessage(from, { video: { url: videoWithWatermark }, caption: "🎫 *With Watermark Video*" }, { quoted: msg });
                } 
                else if (userResponse === '2') {
                    if (!videoNoWatermark) return reply("❌ No-watermark version not available.");
                    await conn.sendMessage(from, { video: { url: videoNoWatermark }, caption: "🎟️ *HD No Watermark Video*" }, { quoted: msg });
                } 
                else if (userResponse === '3') {
                    if (!videoOriginal) return reply("❌ Original quality not available.");
                    await conn.sendMessage(from, { video: { url: videoOriginal }, caption: "📼 *Original Quality Video*" }, { quoted: msg });
                } 
                else if (userResponse === '4') {
                    if (!audio) return reply("❌ Audio not available.");
                    await conn.sendMessage(from, { audio: { url: audio }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: msg });
                } 
                else {
                    await reply("❗Please reply with a valid number (1-4).");
                }
            } catch (err) {
                console.error("Error sending download:", err);
                reply("⚠️ Failed to send the requested file.");
            }
        });

    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});
