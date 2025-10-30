const { cmd } = require('../command');

cmd({
  pattern: "pp",
  alias: ["ppp", "pn"],
  react: "🛡️",
  desc: "Promote a user to admin (Owner & Admin only)",
  category: "group",
  use: ".promote (reply to a user)",
  filename: __filename
},
async (conn, mek, m, {
  from, isGroup, isAdmins, isOwner, participants, reply
}) => {
  try {
    // ✅ Check if in group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // ✅ Check if user is bot owner or group admin
    if (!isOwner && !isAdmins)
      return reply("❌ Only bot owner or group admins can use this command!");

    // ✅ Check if bot is admin
    const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    const botAdmin = participants.find(p => p.id === botNumber && p.admin);
    if (!botAdmin) return reply("❌ Firstly give me admin!");

    // ✅ Check if replied to a user
    const quoted = m.quoted ? m.quoted.sender : false;
    if (!quoted) return reply("⚠️ Please reply to a user to promote them.");

    // ✅ Check if user is already admin (YOUR REQUESTED CODE HERE)
    const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
    if (groupAdmins.includes(quoted)) {
      return reply("✅ That user is already an admin!");
    }

    // ✅ Promote user
    await conn.groupParticipantsUpdate(from, [quoted], "promote");
    reply("🎉 User has been promoted to admin successfully!");

  } catch (e) {
    console.error(e);
    reply(`❌ *Error Occurred!* \n\n${e.message}`);
  }
});
