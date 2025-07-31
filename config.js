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
};
