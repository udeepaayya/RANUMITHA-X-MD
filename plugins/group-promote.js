const { cmd } = require('../command');

cmd({
  pattern: "p",
  alias: ["promote", "makeadmin", "admin", "pp"],
  react: "⬆️",
  desc: "Promote a user to admin (Owner & Admin only)",
  category: "group",
  use: ".pp @taguser",
  filename: __filename
},
async (conn, mek, m, {
  from, isGroup, isAdmins, isOwner, participants, reply
}) => {
  try {

    if (!isGroup) return reply("❌ This command can only be used in groups.");
    if (!isOwner && !isAdmins)
      return reply("❌ Only bot owner or group admins can use this command!");

    // Bot admin check
    const botNumber = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    const botAdmin = participants.find(p => p.id === botNumber && p.admin);
    if (!botAdmin) return reply("❌ Firstly give me admin!");

    // =============================
    //  GET USER FROM REPLY OR TAG
    // =============================
    let user = m.quoted 
      ? m.quoted.sender                     // reply
      : m.mentions && m.mentions[0]         // @tag
        ? m.mentions[0]
        : false;

    if (!user) return reply("⚠️ Please reply or tag a user to promote.");

    // Already admin check
    const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
    if (groupAdmins.includes(user)) {
      return reply("✅ That user is already an admin!");
    }

    // Promote user
    await conn.groupParticipantsUpdate(from, [user], "promote");

    // 🎉 Final Success Message
    await conn.sendMessage(from, {
      text: `✅ *Successfully Promote:* @${user.split("@")[0]}`,
      mentions: [user]
    });

  } catch (e) {
    console.error(e);
    reply(`❌ *Error Occurred!* \n\n${e.message}`);
  }
});
