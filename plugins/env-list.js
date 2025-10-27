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

// Settings menu
cmd({ 
    pattern: "settings", 
    desc: "Owner-only interactive settings menu", 
    category: "system", 
    react: "⚙️", 
    filename: __filename 
}, async (conn, mek, m, { from, isOwner, reply }) => {
    try {
        if (!isOwner) return await reply("❌ Owner Only!");

        const fakevCard = { 
            key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" }, 
            message: { contactMessage: { displayName: "© Bot", vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Bot\nEND:VCARD` } } 
        };

        const menuText = `
╭─『 ⚙️ SETTINGS MENU ⚙️ 』
│ 1. Auto Recording: ${isEnabled(config.AUTO_RECORDING) ? "✅" : "❌"} (1.1 ON / 1.2 OFF)
│ 2. Auto Typing: ${isEnabled(config.AUTO_TYPING) ? "✅" : "❌"} (2.1 ON / 2.2 OFF)
│ 3. Always Online: ${isEnabled(config.ALWAYS_ONLINE) ? "✅" : "❌"} (3.1 ON / 3.2 OFF)
│ 4. Public Mode: ${isEnabled(config.PUBLIC_MODE) ? "✅" : "❌"} (4.1 ON / 4.2 OFF)
│ 5. Auto Voice: ${isEnabled(config.AUTO_VOICE) ? "✅" : "❌"} (5.1 ON / 5.2 OFF)
│ 6. Auto Sticker: ${isEnabled(config.AUTO_STICKER) ? "✅" : "❌"} (6.1 ON / 6.2 OFF)
│ 7. Auto Reply: ${isEnabled(config.AUTO_REPLY) ? "✅" : "❌"} (7.1 ON / 7.2 OFF)
│ 8. Auto React: ${isEnabled(config.AUTO_REACT) ? "✅" : "❌"} (8.1 ON / 8.2 OFF)
│ 9. Anti Link: ${isEnabled(config.ANTI_LINK) ? "✅" : "❌"} (9.1 ON / 9.2 OFF)
│ 10. Welcome: ${isEnabled(config.WELCOME) ? "✅" : "❌"} (10.1 ON / 10.2 OFF)
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

            // Only owner can toggle
            if (!isOwner) return;

            const commandMap = {
                "1.1": { key: "AUTO_RECORDING", value: "true" },
                "1.2": { key: "AUTO_RECORDING", value: "false" },
                "2.1": { key: "AUTO_TYPING", value: "true" },
                "2.2": { key: "AUTO_TYPING", value: "false" },
                "3.1": { key: "ALWAYS_ONLINE", value: "true" },
                "3.2": { key: "ALWAYS_ONLINE", value: "false" },
                "4.1": { key: "PUBLIC_MODE", value: "true" },
                "4.2": { key: "PUBLIC_MODE", value: "false" },
                "5.1": { key: "AUTO_VOICE", value: "true" },
                "5.2": { key: "AUTO_VOICE", value: "false" },
                "6.1": { key: "AUTO_STICKER", value: "true" },
                "6.2": { key: "AUTO_STICKER", value: "false" },
                "7.1": { key: "AUTO_REPLY", value: "true" },
                "7.2": { key: "AUTO_REPLY", value: "false" },
                "8.1": { key: "AUTO_REACT", value: "true" },
                "8.2": { key: "AUTO_REACT", value: "false" },
                "9.1": { key: "ANTI_LINK", value: "true" },
                "9.2": { key: "ANTI_LINK", value: "false" },
                "10.1": { key: "WELCOME", value: "true" },
                "10.2": { key: "WELCOME", value: "false" },
            };

            const selected = commandMap[textMsg.trim()];
            if (!selected) return;

            if (config[selected.key].toString() === selected.value) {
                await conn.sendMessage(fromUser, { text: `⚠️ Already ${selected.value === "true" ? "ON ✅" : "OFF ❌"}` }, { quoted: mekInfo });
                return;
            }

            config[selected.key] = selected.value === "true" ? true : false;
            saveConfig();
            await conn.sendMessage(fromUser, { text: `✅ ${selected.key} set to ${selected.value === "true" ? "ON" : "OFF"}` }, { quoted: mekInfo });
        });

    } catch (e) {
        console.error(e);
        await reply("❌ Error in settings command.");
    }
});
