const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');


// helper: check if enabled
function isEnabled(value) {
    return value === "true" || value === true;
}

// helper: save config permanently
function saveConfig() {
    fs.writeFileSync("./config.js", `module.exports = ${JSON.stringify(config, null, 4)};`);
}

const fakevCard = {
    key: {
        fromMe: false,
        participant: "0@s.whatsapp.net",
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "© Mr Hiruka",
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:Meta
ORG:META AI;
TEL;type=CELL;type=VOICE;waid=94762095304:+94762095304
END:VCARD`
        }
    }
};

cmd({
    pattern: "settings",
    alias: ["env","config","setting"],
    desc: "Interactive bot settings menu (Owner Only)",
    category: "system",
    react: "⚙️",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply }) => {
    try {
        if (!isOwner) {
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
            return reply("🚫 *Owner Only Command!*");
        }

        // Settings menu text
        const info = `╭─『 ⚙️ SETTINGS MENU ⚙️ 』───
│ 2. Auto Recording: ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"} (2.1 ON / 2.2 OFF)
│ 3. Auto Typing: ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"} (3.1 ON / 3.2 OFF)
│ 4. Always Online: ${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"} (4.1 ON / 4.2 OFF)
│ 5. Public Mod: ${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"} (5.1 ON / 5.2 OFF)
│ 6. Auto Voice: ${isEnabled(config.AUTO_VOICE) ? "✅" : "❌"} (6.1 ON / 6.2 OFF)
│ 7. Auto Sticker: ${isEnabled(config.AUTO_STICKER) ? "✅" : "❌"} (7.1 ON / 7.2 OFF)
│ 8. Auto Reply: ${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"} (8.1 ON / 8.2 OFF)
│ 9. Auto React: ${isEnabled(config.AUTO_REACT) ? "✅" : "❌"} (9.1 ON / 9.2 OFF)
│ 10. Auto Status Seen: ${isEnabled(config.AUTO_STATUS_SEEN) ? "✅" : "❌"} (10.1 ON / 10.2 OFF)
│ 11. Status Reply: ${isEnabled(config.AUTO_STATUS_REPLY) ? "✅" : "❌"} (11.1 ON / 11.2 OFF)
│ 12. Status React: ${isEnabled(config.AUTO_STATUS_REACT) ? "✅" : "❌"} (12.1 ON / 12.2 OFF)
│ 13. Custom React: ${isEnabled(config.CUSTOM_REACT) ? "✅" : "❌"} (13.1 ON / 13.2 OFF)
│ 14. Anti VV: ${isEnabled(config.ANTI_VV) ? "✅" : "❌"} (14.1 ON / 14.2 OFF)
│ 15. Welcome: ${isEnabled(config.WELCOME) ? "✅" : "❌"} (15.1 ON / 15.2 OFF)
│ 16. Anti Link: ${isEnabled(config.ANTI_LINK) ? "✅" : "❌"} (16.1 ON / 16.2 OFF)
│ 17. Read Message: ${isEnabled(config.READ_MESSAGE) ? "✅" : "❌"} (17.1 ON / 17.2 OFF)
│ 18. Anti Bad: ${isEnabled(config.ANTI_BAD) ? "✅" : "❌"} (18.1 ON / 18.2 OFF)
│ 19. Anti Link Kick: ${isEnabled(config.ANTI_LINK_KICK) ? "✅" : "❌"} (19.1 ON / 19.2 OFF)
│ 20. Read CMD: ${isEnabled(config.READ_CMD) ? "✅" : "❌"} (20.1 ON / 20.2 OFF)
╰───────────────────╯
Reply with number to toggle ON/OFF (example: 8.1 / 8.2)`;

        const sentMsg = await conn.sendMessage(from, { text: info }, { quoted: fakevCard });
        const menuId = sentMsg.key.id;

        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const mekInfo = msgUpdate?.messages[0];
            if (!mekInfo?.message) return;

            const fromUser = mekInfo.key.remoteJid;
            if (!isOwner) return; // Only owner can toggle

            const textMsg = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;
            const quotedId = mekInfo.message?.extendedTextMessage?.contextInfo?.stanzaId;
            if (quotedId !== menuId) return; // only handle replies to this menu

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

            const selected = commandMap[textMsg?.trim()];
            if (!selected) return await conn.sendMessage(fromUser, { text: "❌ Invalid choice! Reply with number from menu." }, { quoted: mekInfo });

            const { key, toggle } = selected;
            const currentValue = isEnabled(config[key]);

            if (currentValue === toggle) {
                await conn.sendMessage(fromUser, { text: `⚠️ *${key.replace(/_/g," ")} is already ${toggle ? "ON ✅" : "OFF ❌"}*` }, { quoted: mekInfo });
                await conn.sendMessage(fromUser, { react: { text: toggle ? "✅" : "❌", key: mekInfo.key } });
                return;
            }

            config[key] = toggle ? "true" : "false";
            saveConfig();

            await conn.sendMessage(fromUser, { text: `✅ *${key.replace(/_/g," ")} is now ${toggle ? "ON" : "OFF"}*` }, { quoted: mekInfo });
            await conn.sendMessage(fromUser, { react: { text: toggle ? "✅" : "❌", key: mekInfo.key } });
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ Error: ${error.message || "Something went wrong!"}`);
    }
});
