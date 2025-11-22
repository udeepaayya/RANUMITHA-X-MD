const { cmd } = require('../command');

cmd({
  pattern: "promote",
  alias: ["p"],
  react: "⬆️",
  desc: "Promote a user to admin (reply OR @tag support)",
  category: "group",
  use: ".promote (reply or @taguser)",
  filename: __filename
},
async (conn, mek, m, {
  from, isGroup, isAdmins, isOwner, participants, reply
}) => {
  try {

    if (!isGroup) return reply("❌ This command only works in groups.");
    if (!isOwner && !isAdmins)
      return reply("❌ Only bot owner or group admins can use this!");

    // Bot must be admin
    const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    const botAdmin = participants.find(
      p => p.id === botNumber && p.admin
    );
    if (!botAdmin) return reply("❌ First make me admin!");

    // =====================================================
    // GET USER FROM MENTION OR REPLY
    // =====================================================
    let user = false;

    if (m.mentions && m.mentions[0]) {
      user = m.mentions[0];         // @tag
    } else if (m.quoted) {
      user = m.quoted.sender;       // reply to message
    }

    if (!user) {
      return reply(
        "⚠️ Tag a user or reply that user's message.\nExample:\n.promote @user"
      );
    }

    // Already admin?
    const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
    if (groupAdmins.includes(user)) {
      return reply("*✅ That user is already an admin!*");
    }

    // Promote user
    await conn.groupParticipantsUpdate(from, [user], "promote");

    // Success message with tag
    await conn.sendMessage(from, {
      text: `✅ *Successfully Promoted:* @${user.split("@")[0]}`,
      mentions: [user]
    });

  } catch (e) {
    console.error(e);
    reply("❌ Error: " + e.message);
  }
});
