const { cmd } = require('../command')


cmd({
  pattern: "antilinkx",
  alias: ["antilinksx"],
  desc: "Enable or disable ANTI_LINK in groups",
  category: "group",
  react: "🚫",
  filename: __filename
}, async (conn, mek, m, { isGroup, isAdmins, isBotAdmins, args, reply }) => {
  try {
    if (!isGroup) return reply('This command can only be used in a group.');
    if (!isBotAdmins) return reply('Bot must be an admin to use this command.');
    if (!isAdmins) return reply('You must be an admin to use this command.');

    if (args[0] === "on") {
      if (!global.ANTI_LINK_GROUPS) global.ANTI_LINK_GROUPS = {};
      global.ANTI_LINK_GROUPS[m.chat] = true;
      reply("✅ ANTI_LINK has been enabled for this group.");
    } else if (args[0] === "off") {
      if (global.ANTI_LINK_GROUPS) delete global.ANTI_LINK_GROUPS[m.chat];
      reply("❌ ANTI_LINK has been disabled for this group.");
    } else {
      reply("Usage: *.antilink on/off*");
    }
  } catch (e) {
    reply(`Error: ${e.message}`);
  }
});

// Anti-link message listener
conn.on('message', async (message) => {
  try {
    const m = message;
    const from = m.chat;
    const isGroup = m.isGroup;
    const sender = m.sender;
    const text = m.text || m.caption || "";

    if (!isGroup) return;
    if (!global.ANTI_LINK_GROUPS || !global.ANTI_LINK_GROUPS[from]) return;

    const groupMetadata = await conn.groupMetadata(from);
    const isSenderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin !== null;

    // Regex to detect WhatsApp/URLs
    const linkRegex = /(https?:\/\/|www\.)[^\s]+/i;

    if (!isSenderAdmin && linkRegex.test(text)) {
      await conn.deleteMessage(from, { id: m.id, remoteJid: from, fromMe: false });
      await conn.sendMessage(from, { text: `🚫 Link not allowed!` }, { quoted: m });
    }
  } catch (err) {
    console.log("Anti-link error:", err.message);
  }
});
