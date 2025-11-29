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



// =============================
// 9. TRANSLATE (English → Sinhala)
// =============================
cmd({
  pattern: "translate2",
  alias: "trt2","sinhalen",
  react: "🌐",
  desc: "Translate to Sinhala",
  use: ".translate <text>"
}, async (conn, mek, m, { text }) => {
  if (!text) return m.reply("Type something!");

  let url = `https://api.popcat.xyz/translate?to=si&text=${encodeURIComponent(text)}`;
  let res = await fetch(url);
  let data = await res.json();

  m.reply(`🌐 *Translation:*\n${data.translated}`);
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
