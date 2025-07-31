const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "l3dhnSbK#S5ppfxiKNhwrd82cpLtXSINjsuFU5T05fZUUPAkyNnU",
  MONGODB: process.env.MONGODB || "mongodb://mongo:zeeNflUdMhsBAvsFyxNLhUjZPjhuHMko@caboose.proxy.rlwy.net:46999",
  OWNER_NUM: process.env.OWNER_NUM || "94762095304",
  PREFIX: process.env.PREFIX || ".",
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "false",
  MODE: process.env.MODE || "public",
};
