const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "M3FGVJBJ#vQOoJTGPRMRxbz5JMdiDKqcD9rAuO_h1SAhmXiWuHFE",
  MONGODB: process.env.MONGODB || "mongodb://mongo:wOWITGyKuGkFUYAVcdpUmJGtbzewRZpZ@yamabiko.proxy.rlwy.net:36560",
  OWNER_NUM: process.env.OWNER_NUM || "94762095304",
};
