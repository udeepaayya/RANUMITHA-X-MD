const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

// Image & audio
const image = "https://raw.githubusercontent.com/Ranumithaofc/RANU-FILE-S-/refs/heads/main/images/Config%20img%20.jpg";
const audioUrl = "https://github.com/Ranumithaofc/RANU-FILE-S-/raw/refs/heads/main/Audio/env%20new%20typ.opus";

// Helper: check enabled
function isEnabled(value) {
  return value === "true" || value === true;
}

// Helper: save config permanently
function saveConfig() {
  fs.writeFileSync("./config.js", `module.exports = ${JSON.stringify(config, null, 4)};`);
}

// ───────────────────────────────
// SETTINGS MENU
// ───────────────────────────────
cmd({
  pattern: "settings",
  react: "⚙️",
  desc: "Interactive bot settings menu (Owner Only)",
  category: "owner",
  filename: __filename
}, async (conn, mek, m, { reply, isOwner }) => {
  try {
    if (!isOwner) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: mek.key } });
      return reply("🚫 *Owner Only Command!*");
    }

    const info = `
╭─『 ⚙️ 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 𝗠𝗘𝗡𝗨 ⚙️ 』
│
├─❏ *🔖 BOT INFO*
├─∘ *Name:* RANUMITHA-X-MD
├─∘ *Prefix:* ${config.PREFIX}
├─∘ *Owner:* ᴴᴵᴿᵁᴷᴬ ᴿᴬᴺᵁᴹᴵᵀᴴᴬ
├─∘ *Version:* ${config.BOT_VERSION}
│
│ 🛡️ *Select options by replying with number* 
│     (e.g. 8.1 = ON or 8.2 = OFF)
│
│─────────────────────────────
│ 2. Auto Recording: ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"}
│ 3. Auto Typing: ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"}
│ 4. Always Online: ${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"}
│ 5. Public Mode: ${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"}
│ 6. Auto Voice: ${isEnabled(config.AUTO_VOICE) ? "✅" : "❌"}
│ 7. Auto Sticker: ${isEnabled(config.AUTO_STICKER) ? "✅" : "❌"}
│ 8. Auto Reply: ${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"}
│ 9. Auto React: ${isEnabled(config.AUTO_REACT) ? "✅" : "❌"}
│10. Auto Status Seen: ${isEnabled(config.AUTO_STATUS_SEEN) ? "✅" : "❌"}
│11. Status Reply: ${isEnabled(config.AUTO_STATUS_REPLY) ? "✅" : "❌"}
│12. Status React: ${isEnabled(config.AUTO_STATUS_REACT) ? "✅" : "❌"}
│13. Custom React: ${isEnabled(config.CUSTOM_REACT) ? "✅" : "❌"}
│14. Anti VV: ${isEnabled(config.ANTI_VV) ? "✅" : "❌"}
│15. Welcome: ${isEnabled(config.WELCOME) ? "✅" : "❌"}
│16. Anti Link: ${isEnabled(config.ANTI_LINK) ? "✅" : "❌"}
│17. Read Message: ${isEnabled(config.READ_MESSAGE) ? "✅" : "❌"}
│18. Anti Bad: ${isEnabled(config.ANTI_BAD) ? "✅" : "❌"}
│19. Anti Link Kick: ${isEnabled(config.ANTI_LINK_KICK) ? "✅" : "❌"}
│20. Read CMD: ${isEnabled(config.READ_CMD) ? "✅" : "❌"}
╰─────────────────────────────
> © Powerd by 𝗥𝗔𝗡𝗨𝗠𝗜𝗧𝗛𝗔-𝗫-𝗠𝗗 🌛`;

    const sentMsg = await conn.sendMessage(
      m.chat,
      {
        image: { url: image },
        caption: info
      },
      { quoted: mek }
    );

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/ogg',
      ptt: true
    });

    global.lastSettingsMsg = sentMsg.key;
  } catch (e) {
    console.error(e);
    reply("❌ Error: " + e.message);
  }
});

// ───────────────────────────────
// SETTINGS TOGGLE HANDLER
// ───────────────────────────────
cmd({ on: "message" }, async (conn, mek, m, { isOwner }) => {
  try {
    if (!global.lastSettingsMsg) return;
    const quoted = m.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (quoted !== global.lastSettingsMsg.id) return;

    if (!isOwner) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: mek.key } });
      return conn.sendMessage(m.chat, { text: "🚫 *Only Owner Can Change Settings!*" }, { quoted: mek });
    }

    const text = (m.message?.conversation || m.message?.extendedTextMessage?.text || "").trim();
    const commandMap = {
      "2.1": { key: "AUTO_RECORDING", toggle: true },
      "2.2": { key: "AUTO_RECORDING", toggle: false },
      "3.1": { key: "AUTO_TYPING", toggle: true },
      "3.2": { key: "AUTO_TYPING", toggle: false },
      "4.1": { key: "ALWAYS_ONLINE", toggle: true },
      "4.2": { key: "ALWAYS_ONLINE", toggle: false },
      "5.1": { key: "PUBLIC_MODE", toggle: true },
      "5.2": { key: "PUBLIC_MODE", toggle: false },
      "6.1": { key: "AUTO_VOICE", toggle: true },
      "6.2": { key: "AUTO_VOICE", toggle: false },
      "7.1": { key: "AUTO_STICKER", toggle: true },
      "7.2": { key: "AUTO_STICKER", toggle: false },
      "8.1": { key: "AUTO_REPLY", toggle: true },
      "8.2": { key: "AUTO_REPLY", toggle: false },
      "9.1": { key: "AUTO_REACT", toggle: true },
      "9.2": { key: "AUTO_REACT", toggle: false },
      "10.1": { key: "AUTO_STATUS_SEEN", toggle: true },
      "10.2": { key: "AUTO_STATUS_SEEN", toggle: false },
      "11.1": { key: "AUTO_STATUS_REPLY", toggle: true },
      "11.2": { key: "AUTO_STATUS_REPLY", toggle: false },
      "12.1": { key: "AUTO_STATUS_REACT", toggle: true },
      "12.2": { key: "AUTO_STATUS_REACT", toggle: false },
      "13.1": { key: "CUSTOM_REACT", toggle: true },
      "13.2": { key: "CUSTOM_REACT", toggle: false },
      "14.1": { key: "ANTI_VV", toggle: true },
      "14.2": { key: "ANTI_VV", toggle: false },
      "15.1": { key: "WELCOME", toggle: true },
      "15.2": { key: "WELCOME", toggle: false },
      "16.1": { key: "ANTI_LINK", toggle: true },
      "16.2": { key: "ANTI_LINK", toggle: false },
      "17.1": { key: "READ_MESSAGE", toggle: true },
      "17.2": { key: "READ_MESSAGE", toggle: false },
      "18.1": { key: "ANTI_BAD", toggle: true },
      "18.2": { key: "ANTI_BAD", toggle: false },
      "19.1": { key: "ANTI_LINK_KICK", toggle: true },
      "19.2": { key: "ANTI_LINK_KICK", toggle: false },
      "20.1": { key: "READ_CMD", toggle: true },
      "20.2": { key: "READ_CMD", toggle: false }
    };

    const selected = commandMap[text];
    if (!selected) return conn.sendMessage(m.chat, { text: "❌ Invalid choice! Use menu numbers." }, { quoted: mek });

    const { key, toggle } = selected;
    const currentValue = isEnabled(config[key]);

    if (currentValue === toggle) {
      await conn.sendMessage(m.chat, { text: `⚠️ *${key.replace(/_/g, " ")} is already ${toggle ? "ON ✅" : "OFF ❌"}*` }, { quoted: mek });
      await conn.sendMessage(m.chat, { react: { text: toggle ? "✅" : "❌", key: mek.key } });
      return;
    }

    config[key] = toggle ? "true" : "false";
    saveConfig();

    await conn.sendMessage(m.chat, { text: `✅ *${key.replace(/_/g, " ")} is now ${toggle ? "ON*" : "OFF*"}*` }, { quoted: mek });
    await conn.sendMessage(m.chat, { react: { text: toggle ? "✅" : "❌", key: mek.key } });
  } catch (e) {
    console.error(e);
    conn.sendMessage(m.chat, { text: "❌ Error: " + e.message }, { quoted: mek });
  }
});
