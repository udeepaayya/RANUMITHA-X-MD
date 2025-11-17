const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "block",
  react: "🚫",
  desc: "Owner Only: Block the replied user",
  category: "owner",
  use: "Reply to someone and type .block",
  filename: __filename
},
async (conn, mek, m, { from, isOwner, quoted }) => {

  const reply = async (text) => 
    await conn.sendMessage(from, { text }, { quoted: m });

  // OWNER CHECK
  if (!isOwner)
    return reply("🚫 *Owner Only Command!*");

  try {

    // MUST REPLY TO BLOCK
    if (!quoted || !quoted.sender) {
      return reply("⚠️ *Reply to a user's message and type .block*");
    }

    // GET THE REPLIED USER JID
    let targetJid = quoted.sender;

    // REACT WHILE PROCESSING
    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    // SUCCESS MESSAGE BEFORE ACTUAL BLOCK
    await reply("*Block Successfully ✅*");

    // PERFORM BLOCK AFTER SHORT DELAY
    setTimeout(async () => {

      if (typeof conn.updateBlockStatus === "function") {
        await conn.updateBlockStatus(targetJid, "block");
      } else if (typeof conn.blockUser === "function") {
        await conn.blockUser(targetJid);
      } else if (typeof conn.contactBlock === "function") {
        await conn.contactBlock(targetJid);
      }

      console.log("Blocked:", targetJid);

    }, 400); // 0.4s delay

  } catch (err) {
    await reply("❌ Block Failed!\n" + err);
    console.error(err);
  }
});
