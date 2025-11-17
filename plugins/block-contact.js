const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "block",
  react: "🚫",
  desc: "Owner Only: Block the replied user",
  category: "owner",
  use: "Reply to a user message and type .block",
  filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted }) => {

  const reply = async (text) => await conn.sendMessage(from, { text }, { quoted: m });

  // OWNER CHECK
  if (!isOwner) return reply("🚫 *Owner Only Command!*");

  try {

    // MUST REPLY
    if (!quoted || !quoted.sender) {
      return reply("⚠️ *Reply to a user's message and type .block*");
    }

    // GET REPLIED USER JID
    let targetJid = quoted.sender;

    // REACT BEFORE BLOCK
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // SUCCESS MESSAGE FIRST
    await reply("*Block Successfully ✅*");

    // SMALL DELAY THEN REAL BLOCK
    setTimeout(async () => {

      if (typeof conn.updateBlockStatus === "function") {
        await conn.updateBlockStatus(targetJid, "block");
      } 
      else if (typeof conn.blockUser === "function") {
        await conn.blockUser(targetJid);
      } 
      else if (typeof conn.contactBlock === "function") {
        await conn.contactBlock(targetJid);
      }

      console.log("Blocked:", targetJid);

    }, 500);

  } catch (err) {
    await reply("❌ Block Failed!\n" + err);
    console.error(err);
  }
});
