const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

// Helper: check if enabled
function isEnabled(value) {
    return value === "true" || value === true;
}

// Helper: save config permanently
function saveConfig() {
    fs.writeFileSync("./config.js", `module.exports = ${JSON.stringify(config, null, 4)};`);
}

// Full interactive settings menu
cmd({
    pattern: "settings",
    react: "⚙️",
    desc: "Interactive bot settings menu (Owner Only)",
    category: "system",
    filename: __filename
}, async (conn, mek, m, { from, reply, isOwner }) => {
    if (!isOwner) return reply("🚫 Only the owner can use this command!");

    const menu = `
╭─「 ⚙️ SETTINGS MENU ⚙️ 」─
│ 1. Bot Mode:
│    ┣ 1.1  ${config.MODE === "public" ? "public ✅" : "public ❌"}
│    ┣ 1.2  ${config.MODE === "private" ? "private ✅" : "private ❌"}
│    ┣ 1.3  ${config.MODE === "inbox" ? "inbox ✅" : "inbox ❌"}
│ 2. Auto Recording:
│    ┣ 2.1  ${isEnabled(config.AUTO_RECORDING) ? "true ✅" : "false ❌"}
│    ┗ 2.2  ${isEnabled(config.AUTO_RECORDING) ? "false ❌" : "true ✅"}
│ 3. Auto Typing:
│    ┣ 3.1  ${isEnabled(config.AUTO_TYPING) ? "true ✅" : "false ❌"}
│    ┗ 3.2  ${isEnabled(config.AUTO_TYPING) ? "false ❌" : "true ✅"}
│ 4. Always Online:
│    ┣ 4.1  ${isEnabled(config.ALWAYS_ONLINE) ? "true ✅" : "false ❌"}
│    ┗ 4.2  ${isEnabled(config.ALWAYS_ONLINE) ? "false ❌" : "true ✅"}
│ 5. Public Mode:
│    ┣ 5.1  ${isEnabled(config.PUBLIC_MODE) ? "true ✅" : "false ❌"}
│    ┗ 5.2  ${isEnabled(config.PUBLIC_MODE) ? "false ❌" : "true ✅"}
│ 6. Auto Voice:
│    ┣ 6.1  ${isEnabled(config.AUTO_VOICE) ? "true ✅" : "false ❌"}
│    ┗ 6.2  ${isEnabled(config.AUTO_VOICE) ? "false ❌" : "true ✅"}
│ 7. Auto Sticker:
│    ┣ 7.1  ${isEnabled(config.AUTO_STICKER) ? "true ✅" : "false ❌"}
│    ┗ 7.2  ${isEnabled(config.AUTO_STICKER) ? "false ❌" : "true ✅"}
│ 8. Auto Reply:
│    ┣ 8.1  ${isEnabled(config.AUTO_REPLY) ? "true ✅" : "false ❌"}
│    ┗ 8.2  ${isEnabled(config.AUTO_REPLY) ? "false ❌" : "true ✅"}
│ 9. Auto React:
│    ┣ 9.1  ${isEnabled(config.AUTO_REACT) ? "true ✅" : "false ❌"}
│    ┗ 9.2  ${isEnabled(config.AUTO_REACT) ? "false ❌" : "true ✅"}
│ 10. Auto Status Seen:
│    ┣ 10.1  ${isEnabled(config.AUTO_STATUS_SEEN) ? "true ✅" : "false ❌"}
│    ┗ 10.2  ${isEnabled(config.AUTO_STATUS_SEEN) ? "false ❌" : "true ✅"}
│ 11. Status Reply:
│    ┣ 11.1  ${isEnabled(config.AUTO_STATUS_REPLY) ? "true ✅" : "false ❌"}
│    ┗ 11.2  ${isEnabled(config.AUTO_STATUS_REPLY) ? "false ❌" : "true ✅"}
│ 12. Status React:
│    ┣ 12.1  ${isEnabled(config.AUTO_STATUS_REACT) ? "true ✅" : "false ❌"}
│    ┗ 12.2  ${isEnabled(config.AUTO_STATUS_REACT) ? "false ❌" : "true ✅"}
│ 13. Custom React:
│    ┣ 13.1  ${isEnabled(config.CUSTOM_REACT) ? "true ✅" : "false ❌"}
│    ┗ 13.2  ${isEnabled(config.CUSTOM_REACT) ? "false ❌" : "true ✅"}
│ 14. Anti VV:
│    ┣ 14.1  ${isEnabled(config.ANTI_VV) ? "true ✅" : "false ❌"}
│    ┗ 14.2  ${isEnabled(config.ANTI_VV) ? "false ❌" : "true ✅"}
│ 15. Welcome:
│    ┣ 15.1  ${isEnabled(config.WELCOME) ? "true ✅" : "false ❌"}
│    ┗ 15.2  ${isEnabled(config.WELCOME) ? "false ❌" : "true ✅"}
│ 16. Anti Link:
│    ┣ 16.1  ${isEnabled(config.ANTI_LINK) ? "true ✅" : "false ❌"}
│    ┗ 16.2  ${isEnabled(config.ANTI_LINK) ? "false ❌" : "true ✅"}
│ 17. Read Message:
│    ┣ 17.1  ${isEnabled(config.READ_MESSAGE) ? "true ✅" : "false ❌"}
│    ┗ 17.2  ${isEnabled(config.READ_MESSAGE) ? "false ❌" : "true ✅"}
│ 18. Anti Bad:
│    ┣ 18.1  ${isEnabled(config.ANTI_BAD) ? "true ✅" : "false ❌"}
│    ┗ 18.2  ${isEnabled(config.ANTI_BAD) ? "false ❌" : "true ✅"}
│ 19. Anti Link Kick:
│    ┣ 19.1  ${isEnabled(config.ANTI_LINK_KICK) ? "true ✅" : "false ❌"}
│    ┗ 19.2  ${isEnabled(config.ANTI_LINK_KICK) ? "false ❌" : "true ✅"}
│ 20. Read CMD:
│    ┣ 20.1  ${isEnabled(config.READ_CMD) ? "true ✅" : "false ❌"}
│    ┗ 20.2  ${isEnabled(config.READ_CMD) ? "false ❌" : "true ✅"}
╰─ Reply with number like 2.1 to turn ON or 2.2 to turn OFF
`;

    await conn.sendMessage(from, { text: menu });

    // Listen for owner's replies
    conn.ev.on('messages.upsert', async (msgUpdate) => {
        const mekInfo = msgUpdate?.messages[0];
        if (!mekInfo?.message) return;
        if (mekInfo.key.remoteJid !== from) return; // only owner replies

        const textMsg = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;
        const replyMatch = textMsg?.trim().match(/^(\d+)\.(\d)$/);
        if (!replyMatch) return;

        const num = parseInt(replyMatch[1]);
        const toggle = replyMatch[2] === "1";

        // Map numbers to config keys
        const mapping = {
            2: "AUTO_RECORDING",
            3: "AUTO_TYPING",
            4: "ALWAYS_ONLINE",
            5: "PUBLIC_MODE",
            6: "AUTO_VOICE",
            7: "AUTO_STICKER",
            8: "AUTO_REPLY",
            9: "AUTO_REACT",
            10: "AUTO_STATUS_SEEN",
            11: "AUTO_STATUS_REPLY",
            12: "AUTO_STATUS_REACT",
            13: "CUSTOM_REACT",
            14: "ANTI_VV",
            15: "WELCOME",
            16: "ANTI_LINK",
            17: "READ_MESSAGE",
            18: "ANTI_BAD",
            19: "ANTI_LINK_KICK",
            20: "READ_CMD",
        };

        const key = mapping[num];
        if (!key) return reply("❌ Invalid option number!");

        config[key] = toggle;
        saveConfig();

        await conn.sendMessage(from, { text: `✅ *${key.replace(/_/g, " ")} is now ${toggle ? "ON" : "OFF"}*` }, { quoted: mekInfo });
    });
});
