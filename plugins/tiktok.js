const { cmd } = require('../command');
const axios = require('axios');

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
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video with full details and numbered options",
    category: "downloader",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        // ✅ Get TikTok link from command or replied message
        let tiktokUrl = q?.trim();
        if (!tiktokUrl && m?.quoted) {
            tiktokUrl =
                m.quoted.message?.conversation ||
                m.quoted.message?.extendedTextMessage?.text ||
                m.quoted.text;
        }

        if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
            return reply("⚠️ Please provide a valid TikTok link (or reply to a message).");
        }

        await conn.sendMessage(from, { react: { text: '🎥', key: m.key } });

        // ✅ Fetch TikTok info
        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(tiktokUrl)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) return reply("❌ Failed to fetch TikTok video.");

        const { title, author, like, comment, share, meta } = data.data;

        const videoNoWatermark = meta.media.find(v => v.type === "video").org;
        const videoWithWatermark = meta.media.find(v => v.type === "video").wm || videoNoWatermark;
        const audioUrl = meta.music?.playUrl || videoNoWatermark;
        const musicTitle = meta.music?.title || "Original Sound";
        const duration = meta.duration || "Unknown";

        // ✅ Custom thumbnail (like FB plugin)
        const customThumb = "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/RANUMITHA-X-MD%20TIKTOK%20LOGO.jpg";

        // 1️⃣ Send menu with full details
        const caption = `
*🍇 RANUMITHA-X-MD TIKTOK DOWNLOADER 🍇*

👤 \`User:\` ${author.nickname}
📖 \`Title:\` ${title}
⏱️ \`Duration:\` ${duration}
🎵 \`Music:\` ${musicTitle}
👍 \`Likes:\` ${like} 
💬 \`Comments:\` ${comment} 
🔁 \`Shares:\` ${share}
🔗 \`Link:\` ${tiktokUrl}

💬 *Reply with your choice:*

1️⃣ No Watermark 🎟️
2️⃣ With Watermark 🎫
3️⃣ Audio Only 🎶

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: customThumb },
            caption: caption
        }, { quoted: fakevCard });

        const messageID = sentMsg.key.id;

        // 2️⃣ Listen for reply
        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
            const senderID = receivedMsg.key.remoteJid;
            const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

            if (isReplyToBot) {
                let mediaUrl, isAudio = false, captionText;

                switch (receivedText.trim()) {
                    case "1":
                        mediaUrl = videoNoWatermark;
                        captionText = "*TikTok Video (No Watermark)* 🫧";
                        break;
                    case "2":
                        mediaUrl = videoWithWatermark;
                        captionText = "*TikTok Video (With Watermark)* 🫧";
                        break;
                    case "3":
                        mediaUrl = audioUrl;
                        isAudio = true;
                        captionText = "*TikTok Audio* 🎶";
                        break;
                    default:
                        return reply("*❌ Invalid option!*");
                }

                // ⬇️ React when download starts
                await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

                // ⬆️ React exactly at the moment upload starts
                await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });

                if (isAudio) {
                    await conn.sendMessage(senderID, {
                        audio: { url: mediaUrl },
                        mimetype: "audio/mp4",
                        ptt: false,
                        caption: captionText
                    }, { quoted: receivedMsg });
                } else {
                    await conn.sendMessage(senderID, {
                        video: { url: mediaUrl },
                        mimetype: "video/mp4",
                        caption: captionText
                    }, { quoted: receivedMsg });
                }

                // ✅ React after upload complete
                await conn.sendMessage(senderID, { react: { text: '✔️', key: receivedMsg.key } });
            }
        });

    } catch (e) {
        console.error("TikTok plugin error:", e);
        reply("*❌ Error downloading TikTok video.*");
    }
});
