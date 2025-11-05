const { cmd } = require("../command");
const axios = require("axios");

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
    pattern: "img",
    react: "🖼️",
    desc: "Search and download Google images",
    category: "download",
    use: ".img <keywords>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("🖼️ Please provide a search query\nExample: .img cute cats");
        }

        await reply(`🔍 Searching images for *"${query}"*...`);

        const url = `https://supun-md-api-rho.vercel.app/api/search/googleImage?q=${encodeURIComponent(query)}`;
        const response = await axios.get(url);

        if (!response.data?.success || !response.data.results?.length) {
            return reply("❌ No images found. Try different keywords.");
        }

        const results = response.data.results;

        const selectedImages = results
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        for (const imageUrl of selectedImages) {
            try {
                await conn.sendMessage(
                    from,
                    {
                        image: { url: imageUrl },
                        caption: `📷 Result for: *${query}*\n> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`,
                        contextInfo: { mentionedJid: [m.sender] }
                    },
                    { quoted: fakevCard }
                );
            } catch (err) {
                console.warn(`⚠️ Failed to send image: ${imageUrl}`);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error('Image Search Error:', error);
        reply(`❌ Error: ${error.message || "Failed to fetch images"}`);
    }
});


cmd({
    pattern: "image",
    react: "🖼️",
    desc: "Search and download Images",
    category: "download",
    use: ".image <keywords>",
    filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return reply("🖼️ Please provide a search term!\nExample: *.image car*");
        }

        await reply(`🔍 Searching Images for *"${query}"*...`);

        const apiUrl = `https://sadiya-tech-apis.vercel.app/search/wallpaperscraft?q=${encodeURIComponent(query)}&apikey=YOU_API_KEY`;
        const response = await axios.get(apiUrl);

        if (!response.data?.status || !response.data?.result?.images?.length) {
            return reply("❌ No Images found. Try a different keyword.");
        }

        const results = response.data.result.images;
        // Randomly pick 5 images
        const selectedImages = results
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        for (const imageUrl of selectedImages) {
            try {
                await conn.sendMessage(
                    from,
                    {
                        image: { url: imageUrl },
                        caption: `🖼️ Image for: *${query}*\n> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`,
                        contextInfo: { mentionedJid: [m.sender] }
                    },
                    { quoted: fakevCard }
                );
            } catch (err) {
                console.warn(`⚠️ Failed to send Image: ${imageUrl}`);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error('Image Search Error:', error);
        reply(`❌ Error: ${error.message || "Failed to fetch wallpapers"}`);
    }
});
