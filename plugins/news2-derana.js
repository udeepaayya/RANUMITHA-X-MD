const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "news2",
    desc: "Get latest Derana news.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // Derana API
        const response = await axios.get("https://derana.vercel.app/api/derana");
        const articles = response.data;

        if (!articles || !articles.length)
            return reply("⚠️ No news found from Derana.");

        // Send latest 5 news articles
        for (let i = 0; i < Math.min(articles.length, 5); i++) {
            const article = articles[i];

            let message = `
📰 *${article.title}*

${article.description || "No description available."}

🔗 *Link:* ${article.url}

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛
`;

            console.log("Image URL:", article.image);

            if (article.image) {
                await conn.sendMessage(from, {
                    image: { url: article.image },
                    caption: message
                });
            } else {
                await conn.sendMessage(from, { text: message });
            }
        }

    } catch (e) {
        console.error("Derana News Error:", e);
        reply("❌ Could not fetch Derana news. Try again later.");
    }
});
