const { cmd } = require('../command');

// Fixed & Created By Mr Hiruka (Owner Only Block Command)

cmd({
  pattern: "block",
  react: "🚫",
  desc: "Owner Only: Block a WhatsApp number or replied user",
  category: "owner",
  use: ".block 94771234567  OR reply to a user's message and send .block",
  filename: __filename
},
async (conn, mek, m, { from, q, args, isOwner, quoted }) => {

  const reply = async (text) => await conn.sendMessage(from, { text }, { quoted: m });

  // 🧷 Owner Only Protection
  if (!isOwner) return reply("🚫 *Owner Only Command!*");

  try {
    let targetJid;

    if (quoted && quoted.sender) {
      // If user replied to someone
      targetJid = quoted.sender;
    } else if (args && args.length > 0 && args[0].trim() !== "") {
      // If number provided
      let raw = args[0].trim();
      if (raw.includes("@")) {
        targetJid = raw;
      } else {
        let digits = raw.replace(/\D/g, "");
        if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
        targetJid = digits + "@s.whatsapp.net";
      }
    } else {
      return reply("⚠️ උදා: `.block 9477xxxxxxx` හෝ user එකගේ message එක reply කරලා `.block` යවන්න.");
    }

    // 🧩 Try to block user
    if (typeof conn.updateBlockStatus === "function") {
      await conn.updateBlockStatus(targetJid, "block");
    } else if (typeof conn.blockUser === "function") {
      await conn.blockUser(targetJid);
    } else if (typeof conn.contactBlock === "function") {
      await conn.contactBlock(targetJid);
    } else {
      return reply("❌ Bot library එක block function එක support නොකරයි.");
    }

    await reply("✅ *Block Successful!*");
  } catch (err) {
    console.error("Block Command Error:", err);
    await reply("❌ *Block Failed!*\n" + (err.message || String(err)));
  }
});
