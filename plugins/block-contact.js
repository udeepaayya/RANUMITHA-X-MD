const { cmd } = require('../command');
const config = require('../config');

cmd({
  pattern: "block",
  react: "🚫",
  desc: "Owner Only: Block a WhatsApp number",
  category: "owner",
  use: ".block 94771234567  OR reply to user",
  filename: __filename
},
async (conn, mek, m, { from, q, args, isOwner, quoted }) => {

  const reply = async (text) => await conn.sendMessage(from, { text }, { quoted: m });

  // OWNER CHECK
  if (!isOwner) return reply("🚫 *Owner Only Command!*");

  try {
    let targetJid;

    // If replied to user
    if (quoted && quoted.sender) {
      targetJid = quoted.sender;

    // If typed number
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
      return reply("⚠️ Use: `.block 9476xxxxxxx`");
    }

    // BLOCK FUNCTION
    if (typeof conn.updateBlockStatus === "function") {
      await conn.updateBlockStatus(targetJid, "block");
    } 
    else if (typeof conn.blockUser === "function") {
      await conn.blockUser(targetJid);
    }
    else if (typeof conn.contactBlock === "function") {
      await conn.contactBlock(targetJid);
    }
    else {
      return reply("❌ Bot doesn't support block function.");
    }

    // REACT SUCCESS
    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

    // SEND SUCCESS MESSAGE
    await reply("*Block Successfully ✅*");

    console.log("Blocked:", targetJid);

  } catch (err) {
    await reply("❌ Block Failed!\n" + err);
    console.error(err);
  }
});
