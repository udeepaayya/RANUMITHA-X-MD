const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "news2",
  alias: ["latestnews2", "ln2"],
  desc: "Send latest news",
  category: "info",
  react: "📰",
  filename: __filename
},
async (conn, mek, m, { from, reply }) => {
  try {
    reply("⏳ Fetching latest news…");

    // Use any API with 100% working news source
    const url = "https://newsapi.org/v2/top-headlines?country=us&apiKey=demo";
    const res = await axios.get(url);

    const articles = res.data.articles;

    if (!articles || articles.length === 0) {
      return reply("❌ No news found!");
    }

    // Send each news one-by-one
    for (let i = 0; i < articles.length; i++) {
      let news = articles[i];
      let msg = `
📰 *NEWS ${i + 1}*

*Title:* ${news.title || "N/A"}

*Description:* ${news.description || "N/A"}

🔗 *URL:* ${news.url}
`;

      await conn.sendMessage(from, { text: msg }, { quoted: mek });

      await new Promise(resolve => setTimeout(resolve, 700)); // prevent spam block
    }

    // FINAL CONFIRMATION MESSAGE
    await conn.sendMessage(from, { text: "✅ All news sent successfully!" }, { quoted: mek });

  } catch (err) {
    console.log(err);
    reply("❌ Error fetching news!");
  }
});
