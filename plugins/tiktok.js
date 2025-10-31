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
async (conn, mek, m, { from, args, q }) => {
    try {
        if (!q) return conn.sendMessage(from, { text: "Please provide a TikTok video link." }, { quoted: mek });
        if (!q.includes("tiktok.com")) return conn.sendMessage(from, { text: "Invalid TikTok link." }, { quoted: mek });

        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data)
            return conn.sendMessage(from, { text: "❌ Failed to fetch TikTok video details." }, { quoted: mek });

        const { title, like, comment, share, author, meta } = data.data;

        // Extract video/audio links safely
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

        const sentMsg = await conn.sendMessage(from, {
            caption: menuMsg,
            video: { url: videoNoWatermark || videoWithWatermark },
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: mek });

        // ✅ Handle replies
        conn.ev.on('messages.upsert', async (msgData) => {
            const msg = msgData.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;
            const contextId = msg.message.extendedTextMessage.contextInfo?.stanzaId;

            // Check if reply is to the correct message
            if (contextId !== sentMsg.key.id) return;

            const userResponse = msg.message.extendedTextMessage.text.trim();

            const sendSafe = async (content, options = {}) => {
                try {
                    await conn.sendMessage(from, content, options);
                } catch (err) {
                    console.error("Send error:", err);
                }
            };

            if (userResponse === '1') {
                if (!videoWithWatermark) return sendSafe({ text: "❌ Watermark version not available." }, { quoted: msg });
                await sendSafe({ video: { url: videoWithWatermark }, caption: "🎫 *With Watermark Video*" }, { quoted: msg });
            } else if (userResponse === '2') {
                if (!videoNoWatermark) return sendSafe({ text: "❌ No-watermark version not available." }, { quoted: msg });
                await sendSafe({ video: { url: videoNoWatermark }, caption: "🎟️ *HD No Watermark Video*" }, { quoted: msg });
            } else if (userResponse === '3') {
                if (!videoOriginal) return sendSafe({ text: "❌ Original quality not available." }, { quoted: msg });
                await sendSafe({ video: { url: videoOriginal }, caption: "📼 *Original Quality Video*" }, { quoted: msg });
            } else if (userResponse === '4') {
                if (!audio) return sendSafe({ text: "❌ Audio not available." }, { quoted: msg });
                await sendSafe({ audio: { url: audio }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: msg });
            } else {
                await sendSafe({ text: "❗Please reply with a valid number (1-4)." }, { quoted: msg });
            }
        });

    } catch (e) {
        console.error("Error in TikTok downloader command:", e);
        conn.sendMessage(from, { text: `❌ An error occurred: ${e.message}` }, { quoted: mek });
    }
});
