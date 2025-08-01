const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "l3dhnSbK#S5ppfxiKNhwrd82cpLtXSINjsuFU5T05fZUUPAkyNnU",
  OWNER_NUM: process.env.OWNER_NUM || "94762095304",
  PREFIX: process.env.PREFIX || ".",
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
  MODE: process.env.MODE || "public",
  AUTO_VOICE: process.env.AUTO_VOICE || "true",
  AUTO_STICKER: process.env.AUTO_STICKER || "true",
  AUTO_REPLY: process.env.AUTO_REPLY || "true",
  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/GridArt_20250726_193256660.jpg",
  ALIVE_MSG: process.env.ALIVE_MSG || "> 𝐌𝐚𝐝𝐞 𝐛𝐲 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔 🥶"
};
