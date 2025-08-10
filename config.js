const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "07lSkQrT#OfvNGNJ9R4Z4KRMMM2V3pMLdFQTdSzCP3fgjYiUIneQ",   // add your Session Id 
  OWNER_NUM: process.env.OWNER_NUM || "94762095304",
  DEV: process.env.DEV || "94762095304",
  PREFIX: process.env.PREFIX || ".",
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
  MODE: process.env.MODE || "public",   // make bot public-private-inbox-group 
  AUTO_VOICE: process.env.AUTO_VOICE || "true",
  AUTO_STICKER: process.env.AUTO_STICKER || "true",
  AUTO_REPLY: process.env.AUTO_REPLY || "true",
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "true",
  AUTO_RECORDING: process.env.AUTO_RECORDING || "false",
  AUTO_TYPING: process.env.AUTO_TYPING || "false",
  READ_MESSAGE: process.env.READ_MESSAGE || "false",
  AUTO_REACT: process.env.AUTO_REACT || "false",
  READ_CMD: process.env.READ_CMD || "false",
  ANTI_VV: process.env.ANTI_VV || "true",
  CUSTOM_REACT: process.env.CUSTOM_REACT || "false",
  ANTI_DEL_PATH: process.env.ANTI_DEL_PATH || "log",
  STICKER_NAME: process.env.STICKER_NAME || "RANUMITHA-X-MD",
  OWNER_NAME: process.env.OWNER_NAME || "HIRUKA RANUMITHA",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "94762095304",
  BOT_NAME: process.env.BOT_NAME || "RANUMITHA-X-MD",
  BOT_VERSION: process.env.BOT_VERSION || "3.5.8",
  MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "https://files.catbox.moe/ebcvj0.jpg",
  DESCRIPTION: process.env.DESCRIPTION || "© Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛",
  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/GridArt_20250726_193256660.jpg",
  CUSTOM_REACT_EMOJIS: process.env.CUSTOM_REACT_EMOJIS || "💝,💖,💗,❤️‍🩹,❤️,🧡,💛,💚,💙,💜,🤎,🖤,🤍",
  ALIVE_MSG: process.env.ALIVE_MSG || "> 𝐌𝐚𝐝𝐞 𝐛𝐲 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔 🥶"
};
