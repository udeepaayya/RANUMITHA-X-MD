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

// Owner-only settings menu
cmd({ 
    pattern: "settings", 
    desc: "Owner-only interactive settings menu", 
    category: "system", 
    react: "⚙️", 
    filename: __filename 
}, async (conn, mek, m, { from, isOwner, reply }) => {
    try {
        const fakevCard = { 
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" }, 
            message: { contactMessage: { displayName: "© Bot", vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Bot\nEND:VCARD` } } 
        };

        const menuText = `
╭─『 ⚙️ SETTINGS MENU ⚙️ 』
│ 1. Mode: ${config.MODE.toUpperCase()}
│ 2. Auto Recording: ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"} (2.1 ON / 2.2 OFF)
│ 3. Auto Typing: ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"} (3.1 ON / 3.2 OFF)
│ 4. Always Online: ${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"} (4.1 ON / 4.2 OFF)
│ 5. Public Mode: ${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"} (5.1 ON / 5.2 OFF)
│ 6. Auto Voice: ${isEnabled(config.AUTO_VOICE) ? "✅" : "❌"} (6.1 ON / 6.2 OFF)
│ 7. Auto Sticker: ${isEnabled(config.AUTO_STICKER) ? "✅" : "❌"} (7.1 ON / 7.2 OFF)
│ 8. Auto Reply: ${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"} (8.1 ON / 8.2 OFF)
│ 9. Auto React: ${isEnabled(config.AUTO_REACT) ? "✅" : "❌"} (9.1 ON / 9.2 OFF)
│ 10. Anti Delete Msg: ${isEnabled(config.ANTI_DELETE) ? "✅" : "❌"} (10.1 ON / 10.2 OFF)
│ 11. Welcome Msg: ${isEnabled(config.WELCOME_MSG) ? "✅" : "❌"} (11.1 ON / 11.2 OFF)
│ 12. Goodbye Msg: ${isEnabled(config.GOODBYE_MSG) ? "✅" : "❌"} (12.1 ON / 12.2 OFF)
│ 13. Anti Link: ${isEnabled(config.ANTI_LINK) ? "✅" : "❌"} (13.1 ON / 13.2 OFF)
│ 14. Anti Toxic Words: ${isEnabled(config.ANTI_TOXIC) ? "✅" : "❌"} (14.1 ON / 14.2 OFF)
│ 15. Auto Join Voice: ${isEnabled(config.AUTO_JOIN_VOICE) ? "✅" : "❌"} (15.1 ON / 15.2 OFF)
│ 16. NSFW Mode: ${isEnabled(config.NSFW_MODE) ? "✅" : "❌"} (16.1 ON / 16.2 OFF)
│ 17. Bot Info Msg: ${isEnabled(config.BOT_INFO_MSG) ? "✅" : "❌"} (17.1 ON / 17.2 OFF)
│ 18. Anti Spam: ${isEnabled(config.ANTI_SPAM) ? "✅" : "❌"} (18.1 ON / 18.2 OFF)
│ 19. Auto Backup: ${isEnabled(config.AUTO_BACKUP) ? "✅" : "❌"} (19.1 ON / 19.2 OFF)
│ 20. Special Feature: ${isEnabled(config.SPECIAL_FEATURE) ? "✅" : "❌"} (20.1 ON / 20.2 OFF)
╰───────────────────╯
Reply with the number to toggle the option.
`;

        await conn.sendMessage(from, { text: menuText }, { quoted: fakevCard });

        // Listen for owner replies
        conn.ev.on('messages.upsert', async (msgUpdate) => {
            const mekInfo = msgUpdate?.messages[0];
            if (!mekInfo?.message) return;
            const fromUser = mekInfo.key.remoteJid;
            const textMsg = mekInfo.message.conversation || mekInfo.message.extendedTextMessage?.text;

            if (!textMsg) return;

            if (!isOwner) {
                return await conn.sendMessage(fromUser, { react: { text: "❌", key: mekInfo.key } });
            }

            const replyNum = textMsg.trim();

            const commandMap = {
                "2.1": { key: "AUTO_RECORDING", value: "true" },
                "2.2": { key: "AUTO_RECORDING", value: "false" },
                "3.1": { key: "AUTO_TYPING", value: "true" },
                "3.2": { key: "AUTO_TYPING", value: "false" },
                "4.1": { key: "ALWAYS_ONLINE", value: "true" },
                "4.2": { key: "ALWAYS_ONLINE", value: "false" },
                "5.1": { key: "PUBLIC_MODE", value: "true" },
                "5.2": { key: "PUBLIC_MODE", value: "false" },
                "6.1": { key: "AUTO_VOICE", value: "true" },
                "6.2": { key: "AUTO_VOICE", value: "false" },
                "7.1": { key: "AUTO_STICKER", value: "true" },
                "7.2": { key: "AUTO_STICKER", value: "false" },
                "8.1": { key: "AUTO_REPLY", value: "true" },
                "8.2": { key: "AUTO_REPLY", value: "false" },
                "9.1": { key: "AUTO_REACT", value: "true" },
                "9.2": { key: "AUTO_REACT", value: "false" },
                "10.1": { key: "ANTI_DELETE", value: "true" },
                "10.2": { key: "ANTI_DELETE", value: "false" },
                "11.1": { key: "WELCOME_MSG", value: "true" },
                "11.2": { key: "WELCOME_MSG", value: "false" },
                "12.1": { key: "GOODBYE_MSG", value: "true" },
                "12.2": { key: "GOODBYE_MSG", value: "false" },
                "13.1": { key: "ANTI_LINK", value: "true" },
                "13.2": { key: "ANTI_LINK", value: "false" },
                "14.1": { key: "ANTI_TOXIC", value: "true" },
                "14.2": { key: "ANTI_TOXIC", value: "false" },
                "15.1": { key: "AUTO_JOIN_VOICE", value: "true" },
                "15.2": { key: "AUTO_JOIN_VOICE", value: "false" },
                "16.1": { key: "NSFW_MODE", value: "true" },
                "16.2": { key: "NSFW_MODE", value: "false" },
                "17.1": { key: "BOT_INFO_MSG", value: "true" },
                "17.2": { key: "BOT_INFO_MSG", value: "false" },
                "18.1": { key: "ANTI_SPAM", value: "true" },
                "18.2": { key: "ANTI_SPAM", value: "false" },
                "19.1": { key: "AUTO_BACKUP", value: "true" },
                "19.2": { key: "AUTO_BACKUP", value: "false" },
                "20.1": { key: "SPECIAL_FEATURE", value: "true" },
                "20.2": { key: "SPECIAL_FEATURE", value: "false" }
            };

            const selected = commandMap[replyNum];
            if (!selected) return await conn.sendMessage(fromUser, { text: "❌ Invalid choice!" }, { quoted: mekInfo });

            // Already ON/OFF check
            if ((selected.value === "true" && isEnabled(config[selected.key])) || 
                (selected.value === "false" && !isEnabled(config[selected.key]))) {
                await conn.sendMessage(fromUser, { react: { text: "✅", key: mekInfo.key } });
                return await conn.sendMessage(fromUser, { text: `⚠️ ${selected.key} is already ${selected.value === "true" ? "ON" : "OFF"}` }, { quoted: mekInfo });
            }

            config[selected.key] = selected.value;
            saveConfig();

            await conn.sendMessage(fromUser, { react: { text: "✅", key: mekInfo.key } });
            await conn.sendMessage(fromUser, { text: `✅ ${selected.key} has been turned ${selected.value === "true" ? "ON" : "OFF"}` }, { quoted: mekInfo });

        });

    } catch (error) {
        console.error(error);
        await reply("❌ Error opening settings menu.");
    }
});
