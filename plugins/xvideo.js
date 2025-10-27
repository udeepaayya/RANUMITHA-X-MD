const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

const footer = "> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛";

cmd({
    pattern: "xnxx",
    alias: ["xvdl", "xvideo", "phv"],
    use: ".xnxx <video name>",
    react: "🤤",
    desc: "Search & download xnxx.com videos (18+).",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { q, from, reply }) => {
    try {
        if (!q) return await reply("❌ Please enter a video name!");

        const searchApi = await fetchJson(`https://tharuzz-ofc-api-v2.vercel.app/api/search/xvsearch?query=${encodeURIComponent(q)}`);

        if (!searchApi.result?.xvideos?.length) return await reply("❌ No results found!");

        let listText = "🫣 RANUMITHA-X-MD XNXX SEARCH RESULTS\n\n🔢 *ʀᴇᴘʟʏ ʙᴇʟᴏᴡ ᴀ ɴᴜᴍʙᴇʀ ᴄʜᴏᴏꜱᴇ ᴀ ʀᴇᴀᴜʟᴛ.*\n\n";
        searchApi.result.xvideos.forEach((item, i) => {
            listText += `*${i + 1}\.* | ${item.title || "No title"}\n`;
        });

        const listMsg = await conn.sendMessage(
            from,
            { text: listText + `\n\n${footer}` },
            { quoted: mek }
        );

        // Listener for choosing video
        const listListener = async (update) => {
            const msg = update.messages?.[0];
            if (!msg?.message) return;

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === listMsg.key.id;
            if (!isReply) return;

            conn.ev.off("messages.upsert", listListener);

            const index = parseInt(text.trim()) - 1;
            if (isNaN(index) || index < 0 || index >= searchApi.result.xvideos.length) {
                return await reply("❌ Invalid number!");
            }

            const chosen = searchApi.result.xvideos[index];
            const downloadApi = await fetchJson(`https://tharuzz-ofc-api-v2.vercel.app/api/download/xvdl?url=${chosen.link}`);
            const info = downloadApi.result;
            const urlHigh = info.dl_Links.highquality;
            const urlLow = info.dl_Links.lowquality;

            const askMsg = await conn.sendMessage(
                from,
                {
                    image: { url: info.thumbnail },
                    caption: `*🔞 VIDEO INFO*\n\n` +
                        `*Title:* ${info.title}\n` +
                        `*Duration:* ${info.duration}\n\n` +
                        `Reply number:\n1 | High Quality\n2 | Low Quality\n\n${footer}`
                },
                { quoted: msg }
            );

            const typeListener = async (tUpdate) => {
                const tMsg = tUpdate.messages?.[0];
                if (!tMsg?.message) return;

                const tText = tMsg.message.conversation || tMsg.message.extendedTextMessage?.text;
                const isReplyType = tMsg.message.extendedTextMessage?.contextInfo?.stanzaId === askMsg.key.id;
                if (!isReplyType) return;

                conn.ev.off("messages.upsert", typeListener);

                if (tText.trim() === "1") {
                    await conn.sendMessage(from, { video: { url: urlHigh }, caption: `🔞 High Quality Video\n> ${info.title}` }, { quoted: tMsg });
                } else if (tText.trim() === "2") {
                    await conn.sendMessage(from, { video: { url: urlLow }, caption: `🔞 Low Quality Video\n> ${info.title}` }, { quoted: tMsg });
                } else {
                    await conn.sendMessage(from, { text: "❌ Invalid input. Type 1 for high, 2 for low." }, { quoted: tMsg });
                }
            };

            conn.ev.on("messages.upsert", typeListener);
        };

        conn.ev.on("messages.upsert", listListener);

    } catch (e) {
        console.error(e);
        await reply("*❌ Error:* " + e);
    }
});
