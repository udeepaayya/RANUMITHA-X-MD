const { cmd } = require('../command');

// Created by JawadTechX — Modified for Admin Promote Command
cmd({
  pattern: "pp",
  alias: ["pa", "ppp"],
  react: "🛡️",
  desc: "Promote a user to admin (if you're an admin)",
  category: "group",
  use: ".promote (reply to user)",
  filename: __filename
},
async (conn, mek, m, {
  from, isGroup, isAdmins, participants, reply
}) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isAdmins) return reply("❌ You must be a group admin to use this command.");

    // Check if replied to someone
    const quoted = m.quoted ? m.quoted.sender : false;
    if (!quoted) return reply("⚠️ Please reply to a user to promote them.");

    // Check if user is already admin
    const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
    if (groupAdmins.includes(quoted)) {
      return reply("✅ That user is already an admin!");
    }

    // Promote the user
    await conn.groupParticipantsUpdate(from, [quoted], "promote");
    reply("🎉 User has been promoted to admin successfully!");

  } catch (e) {
    console.error(e);
    reply(`❌ *Error Occurred!* \n\n${e.message}`);
  }
});
