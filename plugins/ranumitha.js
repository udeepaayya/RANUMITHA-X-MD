const { cmd } = require("../command");
const fetch = require("node-fetch");



// =============================
// 6. SHORT URL
// =============================
cmd({
  pattern: "shorturl",
  react: "🔗",
  desc: "Shorten any link",
  use: ".short <url>"
}, async (conn, mek, m, { text }) => {
  if (!text) return m.reply("Send a URL!");

  let res = await fetch(`https://tinyurl.com/api-create.php?url=${text}`);
  let short = await res.text();

  m.reply(`🔗 *Short URL:*\n${short}`);
});



cmd({
  pattern: "translate2",
  alias: ["trt2"],
  react: "🌐",
  desc: "Translate text to any language",
  use: ".translate <language> <text>"
}, async (conn, mek, m, { text }) => {
  if (!text) return m.reply("📌 Use: .translate si Hello World");

  // Split the first word as language code, rest as text
  let [lang, ...rest] = text.split(" ");
  let content = rest.join(" ");

  if (!lang || !content) return m.reply("📌 Format: .translate <language_code> <text>");

  try {
    let url = `https://api.popcat.xyz/translate?to=${encodeURIComponent(lang)}&text=${encodeURIComponent(content)}`;
    let res = await fetch(url);
    let data = await res.json();

    if (data.error) return m.reply("❌ Translation failed");

    m.reply(`🌐 *Translation (${lang}):*\n${data.translated}`);
  } catch (e) {
    console.error(e);
    m.reply("❌ Error translating text");
  }
});


// =============================
// 12. RANDOM PASSWORD
// =============================
cmd({
  pattern: "password",
  alias: ["ps"],
  react: "🔐",
  desc: "Generate strong password"
}, async (conn, mek, m) => {
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%&*";
  let pass = "";
  
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  m.reply(`🔐 *Generated Password:*\n${pass}`);
});
