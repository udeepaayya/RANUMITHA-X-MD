const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "block",
  react: "🚫",
  desc: "Owner Only: Block a WhatsApp number or replied user",
  category: "owner",
  use: ".block / .block 9476xxxxxxx",
  filename: __filename
},
async (conn, mek, m, { from, q, args, isOwner, quoted }) => {

  const reply = async (text) => await conn.sendMessage(from, { text }, { quoted: m });

  // OWNER ONLY
  if (!isOwner) return reply("🚫 *Owner Only Command!*");

  try {
    let targetJid;

    // IF USER REPLIED
    if (quoted && quoted.sender) {
      targetJid = quoted.sender;

    // IF NUMBER TYPED
    } else if (args.length > 0) {
      let raw = args[0].trim();
      if (raw.includes("@")) {
        targetJid = raw;
      } else {
        let digits = raw.replace(/\D/g, "");
        if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
        targetJid = digits + "@s.whatsapp.net";
      }
    } else {
      return reply("⚠️ Usage: `.block 9476xxxxxxx` or reply + `.block`");
    }

    // FIRST: REACT PROCESSING
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // SECOND: SUCCESS MESSAGE (BEFORE BLOCK)
    await reply("*Block Successfully ✅*");

    // SHORT DELAY BEFORE REAL BLOCK
    setTimeout(async () => {

      // REAL BLOCK PROCESS
      if (typeof conn.updateBlockStatus === "function") {
        await conn.updateBlockStatus(targetJid, "block");
      } else if (typeof conn.blockUser === "function") {
        await conn.blockUser(targetJid);
      } else if (typeof conn.contactBlock === "function") {
        await conn.contactBlock(targetJid);
      }

      console.log("Blocked:", targetJid);

    }, 600); // 0.6 second delay

  } catch (err) {
    await reply("❌ Block Failed!\n" + err);
    console.error(err);
  }
});
