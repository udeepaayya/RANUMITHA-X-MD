const config = require('../config')
const l = console.log
const { cmd } = require('../command')
const yts = require('yt-search')

// Fake vCard
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
    desc: "Search YouTube videos with thumbnail and reply menu",
    category: "search",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {

        if (!q) return reply('*Please enter a search query!*');

        await conn.sendMessage(from, { react: { text: '🔎', key: m.key } });

        // Search YouTube
        const search = await yts(q);
        const videos = search.videos.slice(0, 8);

        if (!videos || videos.length === 0)
            return reply("❌ No results found!");

        // Thumbnail image (custom like FB plugin)
        const thumb = "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/RANUMITHA-X-MD_FB.jpg";

        // Build caption list with numbers
        let msg = `*🔎 YOUTUBE SEARCH RESULTS*\n\n`;
        videos.forEach((v, i) => {
            msg += `*${i + 1}️⃣ ${v.title}*\n`;
            msg += `⏱️ Duration: ${v.timestamp}\n`;
            msg += `👤 Channel: ${v.author.name}\n`;
            msg += `🔗 ${v.url}\n\n`;
        });

        msg += `Reply with the *number* to get the video/audio.\n\n> © RANUMITHA-X-MD`;

        // Send thumbnail + caption
        const sentMsg = await conn.sendMessage(from, {
            image: { url: thumb },
            caption: msg
        }, { quoted: fakevCard });

        const messageID = sentMsg.key.id;

        // 🔥 Reply listener
        conn.ev.on("messages.upsert", async (msgData) => {
            const receivedMsg = msgData.messages[0];
            if (!receivedMsg?.message) return;

            const text = receivedMsg.message.conversation
                || receivedMsg.message.extendedTextMessage?.text;

            const senderID = receivedMsg.key.remoteJid;
            const replyID = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId;

            if (replyID === messageID) {

                const num = parseInt(text.trim());
                if (isNaN(num) || num < 1 || num > videos.length)
                    return reply("*❌ Invalid number!*");

                const vid = videos[num - 1];

                // ⬇️ React for download
                await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

                // ⬆️ React for upload start
                await conn.sendMessage(senderID, { react: { text: '⬆️', key: receivedMsg.key } });

                // Send chosen video
                await conn.sendMessage(senderID, {
                    video: { url: vid.url },
                    caption: `🎬 *${vid.title}*\n\nDownloaded by *RANUMITHA-X-MD*`
                }, { quoted: receivedMsg });

                // Complete reaction
                await conn.sendMessage(senderID, { react: { text: '✅', key: receivedMsg.key } });
            }
        });

    } catch (e) {
        l(e);
        reply('*Error while searching YouTube!*');
    }
});
