const { cmd } = require("../command");
const fetch = require("node-fetch");


// =============================
// 4. RANDOM QUOTE
// =============================
cmd({
  pattern: "quote",
  react: "📜",
  desc: "Random motivational quote"
}, async (conn, mek, m) => {
  const quotes = [
    "Dream big. Work hard.",
    "Stay positive. Better days are coming.",
    "Success is not final. Failure is not fatal.",
    "You become what you believe."
  ];

  let q = quotes[Math.floor(Math.random() * quotes.length)];
  m.reply(`📜 *Quote*\n\n${q}`);
});

// =============================
// 5. FUN FACT
// =============================
cmd({
  pattern: "fact",
  react: "🌍",
  desc: "Random fun fact"
}, async (conn, mek, m) => {
  const facts = [
    "Honey never spoils.",
    "Octopuses have 3 hearts.",
    "A day on Venus is longer than a year.",
    "Bananas are berries. Strawberries are not."
  ];

  let f = facts[Math.floor(Math.random() * facts.length)];
  m.reply(`🌍 *Fun Fact*\n\n${f}`);
});

// =============================
// 6. SHORT URL
// =============================
cmd({
  pattern: "short",
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
  pattern: "translate",
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


cmd({
  pattern: "weather2",
  react: "☁️",
  desc: "Get weather info",
  use: ".weather Colombo"
}, async (conn, mek, m, { text }) => {
  if (!text) return m.reply("Give city name!");

  let api = await fetch(`https://api.popcat.xyz/weather?q=${text}`);
  let data = await api.json();

  m.reply(`☁️ *Weather: ${text}*

🌡 Temp: ${data.temperature}°C  
💧 Humidity: ${data.humidity}%  
🌬 Wind: ${data.wind_speed} km/h  
`);
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
    m.reply(`${pass}`);
});
