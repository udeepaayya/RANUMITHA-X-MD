const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "news",
    desc: "Get latest Derana news.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const response = await axios.get("https://derana.vercel.app/api/derana");
        
        if (!response.data.status) 
            return reply("⚠️ Could not fetch Derana news.");

        const news = response.data.result;

        let message = `
📰 *${news.title}*

📅 *Date:* ${news.date}

${news.desc}

🔗 *Read More:* ${news.url}

> © Powered by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛
        `;

        if (news.image) {
            await conn.sendMessage(from, { 
                image: { url: news.image }, 
                caption: message 
            });
        } else {
            await conn.sendMessage(from, { text: message });
        }

    } catch (err) {
        console.error(err);
        reply("❌ Error: Cannot fetch Derana news.");
    }
});
