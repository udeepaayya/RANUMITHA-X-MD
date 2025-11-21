const { cmd } = require('../command');

// ======= ANTI-LINK TOGGLE COMMAND =======
cmd({
  pattern: "antilink",
  alias: ["antilinks"],
  desc: "Enable or disable ANTI_LINK in groups",
  category: "group",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply("📛 *Group command only!*");
    if (!isAdmins) return reply("📛 *Only admins can use this command!*");
    if (!isBotAdmins) return reply("📛 *Bot must be admin!*");

    if (!global.ANTI_LINK_GROUPS) global.ANTI_LINK_GROUPS = {};

    if (args[0] === "on") {
      global.ANTI_LINK_GROUPS[from] = true;
      reply("✅ *ANTI_LINK has been enabled for this group.*");
    } else if (args[0] === "off") {
      delete global.ANTI_LINK_GROUPS[from];
      reply("❌ *ANTI_LINK has been disabled for this group.*");
    } else {
      reply("⚠️ Usage: *.antilink on/off*");
    }
  } catch (e) {
    reply(`❌ Error: ${e.message}`);
  }
});

// ======= ANTI-LINK MESSAGE HANDLER =======
conn.on('message', async (mek) => {
  try {
    const from = mek.chat;
    const isGroup = mek.isGroup;
    const sender = mek.sender;
    const text = mek.text || mek.caption || "";

    if (!isGroup) return;
    if (!global.ANTI_LINK_GROUPS || !global.ANTI_LINK_GROUPS[from]) return;

    // Get group participants and check if sender is admin
    const groupMetadata = await conn.groupMetadata(from);
    const participant = groupMetadata.participants.find(p => p.id === sender);
    const isSenderAdmin = participant?.admin !== null;

    // Regex to detect links
    const linkRegex = /(https?:\/\/|www\.)[^\s]+/i;

    if (!isSenderAdmin && linkRegex.test(text)) {
      // Delete message
      await conn.deleteMessage(from, { id: mek.id, remoteJid: from, fromMe: false });
      // Send warning
      await conn.sendMessage(from, { text: `🚫 Link not allowed!` }, { quoted: mek });
    }
  } catch (err) {
    console.log("Anti-link error:", err.message);
  }
});
